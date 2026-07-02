/* ==========================================================================
   수아홈(suahhome.com) 메인 스크립트 (JavaScript)
   홈페이지의 다크 모드 토글과 방명록 실시간 등록을 담당합니다.
   컴퓨터가 어떻게 이 화면들을 작동시키는지 한 줄씩 쉽게 적어두었어요!
   ========================================================================== */

// HTML 문서가 완전히 불러와지면 스크립트 실행
document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================
       1. 다크 모드 (화면 테마 전환) 기능
       ========================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // 이전에 사용자가 다크 모드로 설정했는지 브라우저 메모리(localStorage)에서 확인합니다.
    const savedTheme = localStorage.getItem('theme');
    
    // 만약 예전에 다크 모드로 설정했다면 페이지에 다크 모드를 즉시 적용합니다.
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // 테마 토글 버튼을 마우스로 클릭했을 때 일어나는 일
    themeToggleBtn.addEventListener('click', () => {
        // body 태그에 'dark-mode'라는 이름의 클래스를 넣었다 뺐다(toggle) 합니다.
        document.body.classList.toggle('dark-mode');
        
        // 현재 다크 모드가 켜져 있는지 확인하고 브라우저 메모리에 저장합니다.
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark'); // 다크 모드 켜짐 저장
        } else {
            localStorage.setItem('theme', 'light'); // 라이트 모드 켜짐 저장
        }
    });

    /* ==========================================
       2. 실시간 방명록 등록 기능
       ========================================== */
    const guestbookForm = document.getElementById('guestbook-form');
    const guestbookList = document.getElementById('guestbook-list');
    const messageCountSpan = document.getElementById('message-count');
    
    // 현재 올라와 있는 방명록 개수 세기 (처음 예시 글 개수 2개로 시작)
    let currentMessageCount = 2;

    // 방명록 쓰기 버튼(Submit)을 누르면 실행되는 일
    guestbookForm.addEventListener('submit', (event) => {
        // 1. 버튼을 눌렀을 때 페이지가 새로고침되는 기본 행동을 강제로 막습니다.
        event.preventDefault();
        
        // 2. 사용자가 입력한 이름과 메시지 글을 가져옵니다.
        const nicknameInput = document.getElementById('nickname');
        const messageInput = document.getElementById('message');
        
        const nickname = nicknameInput.value.trim();
        const message = messageInput.value.trim();
        
        // 빈 칸이 있다면 등록을 건너뜁니다.
        if (!nickname || !message) return;

        // 3. 방명록이 등록되는 현재 날짜와 시간 구하기
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해줍니다.
        const date = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const formattedDate = `${year}. ${month}. ${date} ${hours}:${minutes}`;

        // 4. 새로운 방명록 카드(HTML 박스)를 만듭니다.
        const newCard = document.createElement('div');
        newCard.className = 'guestbook-card';
        
        // 카드 내부에 들어갈 글자들을 HTML 형식으로 채워 넣습니다.
        newCard.innerHTML = `
            <div class="card-header">
                <span class="guest-name">${escapeHtml(nickname)}</span>
                <span class="guest-date">${formattedDate}</span>
            </div>
            <p class="guest-msg">${escapeHtml(message)}</p>
        `;

        // 5. 방명록 리스트의 맨 위(가장 첫 번째 자식 위치)에 새로운 카드를 추가합니다.
        guestbookList.insertBefore(newCard, guestbookList.firstChild);

        // 6. 방명록 총 개수 1 증가시키기
        currentMessageCount += 1;
        messageCountSpan.textContent = currentMessageCount;

        // 7. 작성 완료 후 입력창을 모두 깨끗이 비워줍니다.
        nicknameInput.value = '';
        messageInput.value = '';
        
        // 8. 작성한 새 글로 스크롤을 살짝 이동시켜줍니다.
        newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    /* ==========================================
       3. 다이어리 상세보기 모달 팝업 기능
       ========================================== */
    const diaryModal = document.getElementById('diary-modal');
    const modalImg = document.getElementById('modal-img');
    const modalEmojiPlaceholder = document.getElementById('modal-emoji-placeholder');
    const modalEmoji = document.getElementById('modal-emoji');
    const modalDate = document.getElementById('modal-date');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const closeModalBtn = diaryModal.querySelector('.close-button');

    // 갤러리 내 모든 카드들을 찾아서 클릭 이벤트 연결
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // 1. 카드 안에서 날짜와 제목 텍스트 가져오기
            const dateText = item.querySelector('.date').textContent;
            const titleText = item.querySelector('h4').textContent;
            
            // 2. data-detail에 숨겨져 있는 상세한 긴 글 가져오기
            const detailText = item.getAttribute('data-detail') || "상세한 일기 내용이 없습니다.";
            
            // 3. 이미지 정보 가져오기 (실제 이미지가 있는 카드인지 확인)
            const imgElement = item.querySelector('.gallery-img');
            const emojiPlaceholder = item.querySelector('.gallery-emoji-placeholder');
            
            if (imgElement) {
                // 이미지가 있는 카드라면, 이미지 보이고 이모지 숨김
                modalImg.style.display = 'block';
                modalImg.src = imgElement.src;
                modalImg.alt = imgElement.alt;
                modalEmojiPlaceholder.style.display = 'none';
            } else if (emojiPlaceholder) {
                // 이모지 카드의 경우, 이미지 숨기고 이모지와 배경 그라데이션 재현
                modalImg.style.display = 'none';
                modalEmojiPlaceholder.style.display = 'flex';
                modalEmojiPlaceholder.style.background = emojiPlaceholder.style.background;
                modalEmoji.textContent = emojiPlaceholder.querySelector('span').textContent;
            }

            // 4. 모달창 텍스트 채우기
            modalDate.textContent = dateText;
            modalTitle.textContent = titleText;
            modalDesc.textContent = detailText;

            // 5. 모달창 띄우기
            diaryModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // 뒤쪽 화면 스크롤 금지
        });
    });

    // 닫기 버튼 클릭 시 모달창 닫기
    closeModalBtn.addEventListener('click', () => {
        closeModal();
    });

    // 모달창 바깥쪽 어두운 배경 클릭 시 닫기
    diaryModal.addEventListener('click', (event) => {
        if (event.target === diaryModal) {
            closeModal();
        }
    });

    // 모달 닫기 공통 함수
    function closeModal() {
        diaryModal.classList.remove('show');
        document.body.style.overflow = ''; // 스크롤 원래대로
    }

    /**
     * 보안을 위한 안전장치: HTML 특수문자 방지 함수
     * 사용자가 방명록에 해킹 코드(<script> 등)를 적는 것을 막아줍니다.
     */
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* ==========================================

    // 전역 선택 및 삭제/수정 대상 트래킹용 변수
    let currentSelectedDiaryId = '';
    let currentSelectedPhotoSrc = ''; // 실제로는 photoCard 의 id 를 담음
    
    // 수정 모드 상태 변수
    let editDiaryTargetId = '';
    let editPhotoTargetId = '';

    /* ==========================================
       4. 다이어리 직접 쓰기 및 수정 (스마트폰/PC 사진 선택 지원)
       ========================================== */
    const toggleFormBtn = document.getElementById('toggle-diary-form');
    const formContainer = document.getElementById('diary-form-container');
    const diaryForm = document.getElementById('diary-form');
    const mediaTypeSelect = document.getElementById('diary-media-type');
    const imageGroup = document.getElementById('image-url-group');
    const emojiGroup = document.getElementById('emoji-group');
    const galleryGrid = document.querySelector('.gallery-grid');
    
    const modalEditDiaryBtn = document.getElementById('modal-edit-diary');
    const modalDeleteDiaryBtn = document.getElementById('modal-delete-diary');

    // 4-1. 일기 쓰기 폼 토글
    if (toggleFormBtn && formContainer) {
        toggleFormBtn.addEventListener('click', () => {
            if (formContainer.style.display === 'none') {
                formContainer.style.display = 'block';
                toggleFormBtn.textContent = '❌ 작성 취소';
                
                const now = new Date();
                const formattedToday = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}`;
                document.getElementById('diary-date').value = formattedToday;
                
                // 쓰기 모드로 초기화
                editDiaryTargetId = '';
                diaryForm.querySelector('button[type="submit"]').textContent = '등록하기 💖';
            } else {
                formContainer.style.display = 'none';
                toggleFormBtn.textContent = '✏️ 새 일기 쓰기';
                diaryForm.reset();
            }
        });
    }

    // 4-2. 다이어리 탭 내 "➕ 새 일기 작성하기" 카드 클릭 연동
    const addDiaryCard = document.getElementById('add-diary-card');
    if (addDiaryCard) {
        addDiaryCard.addEventListener('click', () => {
            if (formContainer && formContainer.style.display === 'none') {
                formContainer.style.display = 'block';
                if (toggleFormBtn) toggleFormBtn.textContent = '❌ 작성 취소';
                
                const now = new Date();
                const formattedToday = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}`;
                document.getElementById('diary-date').value = formattedToday;
                
                // 쓰기 모드 초기화
                editDiaryTargetId = '';
                diaryForm.querySelector('button[type="submit"]').textContent = '등록하기 💖';
            }
            if (formContainer) {
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // 4-3. 미디어 타입 분기
    if (mediaTypeSelect) {
        mediaTypeSelect.addEventListener('change', () => {
            if (mediaTypeSelect.value === 'image') {
                imageGroup.style.display = 'block';
                emojiGroup.style.display = 'none';
            } else {
                imageGroup.style.display = 'none';
                emojiGroup.style.display = 'block';
            }
        });
    }

    // 4-4. 다이어리 카드 DOM 렌더링 함수
    function addDiaryCardToDOM(diary, prepend = true) {
        const targetGrid = galleryGrid || document.querySelector('.gallery-section .gallery-item')?.parentElement;
        if (!targetGrid) return;
        
        const newCard = document.createElement('div');
        newCard.className = 'gallery-item';
        newCard.setAttribute('data-id', diary.id || `custom-${Date.now()}`);
        newCard.setAttribute('data-detail', diary.detail);

        let mediaHtml = '';
        if (diary.mediaType === 'image') {
            mediaHtml = `
                <div class="gallery-image-wrapper">
                    <img src="${diary.image}" alt="${escapeHtml(diary.title)}" class="gallery-img">
                </div>
            `;
        } else {
            const gradients = [
                'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
                'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
            ];
            const randomGrad = gradients[Math.floor(Math.random() * gradients.length)];
            mediaHtml = `
                <div class="gallery-emoji-placeholder" style="background: ${randomGrad};">
                    <span>${escapeHtml(diary.emoji)}</span>
                </div>
            `;
        }

        newCard.innerHTML = `
            ${mediaHtml}
            <div class="gallery-info">
                <span class="date">${escapeHtml(diary.date)}</span>
                <h4>${escapeHtml(diary.title)}</h4>
                <p>${escapeHtml(diary.summary)}</p>
            </div>
        `;

        // 일기 상세 보기 모달 연결
        newCard.addEventListener('click', () => {
            const dateText = newCard.querySelector('.date').textContent;
            const titleText = newCard.querySelector('h4').textContent;
            const detailText = newCard.getAttribute('data-detail') || "상세 내용이 없습니다.";
            
            currentSelectedDiaryId = newCard.getAttribute('data-id');

            const imgElement = newCard.querySelector('.gallery-img');
            const emojiPlaceholder = newCard.querySelector('.gallery-emoji-placeholder');
            
            if (imgElement) {
                modalImg.style.display = 'block';
                modalImg.src = imgElement.src;
                modalImg.alt = imgElement.alt;
                modalEmojiPlaceholder.style.display = 'none';
            } else if (emojiPlaceholder) {
                modalImg.style.display = 'none';
                modalEmojiPlaceholder.style.display = 'flex';
                modalEmojiPlaceholder.style.background = emojiPlaceholder.style.background;
                modalEmoji.textContent = emojiPlaceholder.querySelector('span').textContent;
            }

            modalDate.textContent = dateText;
            modalTitle.textContent = titleText;
            modalDesc.textContent = detailText;

            diaryModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        const addCardNode = document.getElementById('add-diary-card');
        if (prepend && addCardNode && addCardNode.nextSibling) {
            targetGrid.insertBefore(newCard, addCardNode.nextSibling);
        } else if (prepend && addCardNode) {
            targetGrid.appendChild(newCard);
        } else {
            targetGrid.appendChild(newCard);
        }
    }

    // 다이어리 전체 다시 그리기
    function reloadDiaries() {
        const items = document.querySelectorAll('.gallery-grid .gallery-item:not(.add-card)');
        items.forEach(i => i.remove());
        loadSavedDiaries();
    }

    // 4-5. 로컬스토리지에서 기존 작성 일기 로드 및 기본 일기 수정/삭제 적용
    function loadSavedDiaries() {
        const deletedStr = localStorage.getItem('deleted_default_diaries');
        const deletedDefaultIds = deletedStr ? JSON.parse(deletedStr) : [];

        // 수정된 기본 일기 데이터 맵 로드
        const editedDefaultStr = localStorage.getItem('edited_default_diaries');
        const editedDefaultDiaries = editedDefaultStr ? JSON.parse(editedDefaultStr) : {};

        const staticItems = document.querySelectorAll('.gallery-grid .gallery-item:not(.add-card)');
        staticItems.forEach(item => {
            const staticId = item.getAttribute('data-id');
            if (deletedDefaultIds.includes(staticId)) {
                item.remove();
            } else {
                // 수정된 기록이 있으면 오버라이딩 적용
                if (editedDefaultDiaries[staticId]) {
                    const edited = editedDefaultDiaries[staticId];
                    item.setAttribute('data-detail', edited.detail);
                    item.querySelector('.date').textContent = edited.date;
                    item.querySelector('h4').textContent = edited.title;
                    item.querySelector('.gallery-info p').textContent = edited.summary;
                    
                    const img = item.querySelector('.gallery-img');
                    if (img && edited.mediaType === 'image') {
                        img.src = edited.image;
                    }
                    const emojiSpan = item.querySelector('.gallery-emoji-placeholder span');
                    if (emojiSpan && edited.mediaType === 'emoji') {
                        emojiSpan.textContent = edited.emoji;
                    }
                }

                item.addEventListener('click', () => {
                    currentSelectedDiaryId = staticId;
                });
            }
        });

        const saved = localStorage.getItem('custom_diaries');
        if (!saved) return;
        const customDiaries = JSON.parse(saved);
        customDiaries.reverse().forEach(diary => {
            addDiaryCardToDOM(diary, true);
        });
        customDiaries.reverse();
    }

    // 4-6. 일기 폼 등록/수정 제출 이벤트 (로컬 파일 읽기 및 수정 분기 지원)
    if (diaryForm) {
        diaryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const date = document.getElementById('diary-date').value.trim();
            const title = document.getElementById('diary-title').value.trim();
            const summary = document.getElementById('diary-summary').value.trim();
            const mediaType = mediaTypeSelect.value;
            const emoji = document.getElementById('diary-emoji').value.trim() || '😸';
            const detail = document.getElementById('diary-detail').value.trim();

            const fileInput = document.getElementById('diary-image-file');
            
            const submitDiary = (imageSrc) => {
                if (editDiaryTargetId) {
                    // [수정 모드]
                    if (editDiaryTargetId.startsWith('default-')) {
                        // 1. 기본 일기 수정 저장
                        const editedDefaultStr = localStorage.getItem('edited_default_diaries');
                        const editedDefaultDiaries = editedDefaultStr ? JSON.parse(editedDefaultStr) : {};
                        
                        // 이미지가 업로드 안 되었을 때는 기존 이미지 복원
                        let finalImage = imageSrc;
                        if (!finalImage && mediaType === 'image') {
                            const originalCard = document.querySelector(`.gallery-grid .gallery-item[data-id="${editDiaryTargetId}"]`);
                            const origImg = originalCard ? originalCard.querySelector('.gallery-img') : null;
                            if (origImg) finalImage = origImg.src;
                        }

                        editedDefaultDiaries[editDiaryTargetId] = {
                            id: editDiaryTargetId, date, title, summary, mediaType, image: finalImage, emoji, detail
                        };
                        localStorage.setItem('edited_default_diaries', JSON.stringify(editedDefaultDiaries));
                    } else {
                        // 2. 커스텀 일기 수정 저장
                        const saved = localStorage.getItem('custom_diaries');
                        const customDiaries = saved ? JSON.parse(saved) : [];
                        
                        let finalImage = imageSrc;
                        const targetObj = customDiaries.find(d => d.id === editDiaryTargetId);
                        if (!finalImage && targetObj && mediaType === 'image') {
                            finalImage = targetObj.image;
                        }

                        customDiaries.forEach(d => {
                            if (d.id === editDiaryTargetId) {
                                d.date = date;
                                d.title = title;
                                d.summary = summary;
                                d.mediaType = mediaType;
                                d.image = finalImage;
                                d.emoji = emoji;
                                d.detail = detail;
                            }
                        });
                        localStorage.setItem('custom_diaries', JSON.stringify(customDiaries));
                    }

                    editDiaryTargetId = '';
                    diaryForm.querySelector('button[type="submit"]').textContent = '등록하기 💖';
                } else {
                    // [신규 등록 모드]
                    const id = `custom-${Date.now()}`;
                    const newDiary = { id, date, title, summary, mediaType, image: imageSrc, emoji, detail };
                    addDiaryCardToDOM(newDiary, true);

                    const saved = localStorage.getItem('custom_diaries');
                    const customDiaries = saved ? JSON.parse(saved) : [];
                    customDiaries.unshift(newDiary);
                    localStorage.setItem('custom_diaries', JSON.stringify(customDiaries));
                }

                diaryForm.reset();
                formContainer.style.display = 'none';
                if (toggleFormBtn) toggleFormBtn.textContent = '✏️ 새 일기 쓰기';
                reloadDiaries();
            };

            if (mediaType === 'image' && fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    submitDiary(event.target.result);
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                submitDiary('');
            }
        });
    }

    // 4-7. 모달 내 "일기 삭제" 버튼 동작
    if (modalDeleteDiaryBtn) {
        modalDeleteDiaryBtn.addEventListener('click', () => {
            if (!currentSelectedDiaryId) return;
            if (confirm('이 일기를 정말 삭제하시겠어요? 😢')) {
                const targetCard = document.querySelector(`.gallery-grid .gallery-item[data-id="${currentSelectedDiaryId}"]`);
                if (targetCard) targetCard.remove();

                if (currentSelectedDiaryId.startsWith('default-')) {
                    const deletedStr = localStorage.getItem('deleted_default_diaries');
                    const deletedDefaultIds = deletedStr ? JSON.parse(deletedStr) : [];
                    deletedDefaultIds.push(currentSelectedDiaryId);
                    localStorage.setItem('deleted_default_diaries', JSON.stringify(deletedDefaultIds));
                } else {
                    const saved = localStorage.getItem('custom_diaries');
                    const customDiaries = saved ? JSON.parse(saved) : [];
                    const filtered = customDiaries.filter(d => d.id !== currentSelectedDiaryId);
                    localStorage.setItem('custom_diaries', JSON.stringify(filtered));
                }

                closeModal();
                currentSelectedDiaryId = '';
            }
        });
    }

    // 4-8. 모달 내 "일기 수정" 버튼 동작 (Form Pre-fill)
    if (modalEditDiaryBtn) {
        modalEditDiaryBtn.addEventListener('click', () => {
            if (!currentSelectedDiaryId) return;
            
            // 수정 대상 지정
            editDiaryTargetId = currentSelectedDiaryId;
            
            // 기존 데이터 수집
            let dateText = '', titleText = '', summaryText = '', detailText = '', mediaType = 'image', emojiText = '😸';
            
            if (editDiaryTargetId.startsWith('default-')) {
                const editedDefaultStr = localStorage.getItem('edited_default_diaries');
                const editedDefaultDiaries = editedDefaultStr ? JSON.parse(editedDefaultStr) : {};
                
                if (editedDefaultDiaries[editDiaryTargetId]) {
                    const d = editedDefaultDiaries[editDiaryTargetId];
                    dateText = d.date;
                    titleText = d.title;
                    summaryText = d.summary;
                    detailText = d.detail;
                    mediaType = d.mediaType;
                    emojiText = d.emoji;
                } else {
                    // DOM에서 텍스트 수집
                    const card = document.querySelector(`.gallery-grid .gallery-item[data-id="${editDiaryTargetId}"]`);
                    dateText = card.querySelector('.date').textContent;
                    titleText = card.querySelector('h4').textContent;
                    summaryText = card.querySelector('.gallery-info p').textContent;
                    detailText = card.getAttribute('data-detail');
                    mediaType = card.querySelector('.gallery-img') ? 'image' : 'emoji';
                    if (mediaType === 'emoji') {
                        emojiText = card.querySelector('.gallery-emoji-placeholder span').textContent;
                    }
                }
            } else {
                const saved = localStorage.getItem('custom_diaries');
                const customDiaries = saved ? JSON.parse(saved) : [];
                const d = customDiaries.find(item => item.id === editDiaryTargetId);
                if (d) {
                    dateText = d.date;
                    titleText = d.title;
                    summaryText = d.summary;
                    detailText = d.detail;
                    mediaType = d.mediaType;
                    emojiText = d.emoji;
                }
            }

            // 폼 필드 채우기
            document.getElementById('diary-date').value = dateText;
            document.getElementById('diary-title').value = titleText;
            document.getElementById('diary-summary').value = summaryText;
            document.getElementById('diary-detail').value = detailText;
            mediaTypeSelect.value = mediaType;
            document.getElementById('diary-emoji').value = emojiText;

            // 미디어 분기 갱신
            if (mediaType === 'image') {
                imageGroup.style.display = 'block';
                emojiGroup.style.display = 'none';
            } else {
                imageGroup.style.display = 'none';
                emojiGroup.style.display = 'block';
            }

            // 폼 오픈 및 수정 모드 텍스트 변경
            closeModal();
            formContainer.style.display = 'block';
            if (toggleFormBtn) toggleFormBtn.textContent = '❌ 수정 취소';
            diaryForm.querySelector('button[type="submit"]').textContent = '수정 완료 💖';
            
            // 화면 스크롤
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }


    /* ==========================================
       5. 독립적인 사진첩 (Photos) 기능 및 원본 뷰어/수정
       ========================================== */
    const togglePhotoFormBtn = document.getElementById('toggle-photo-form');
    const photoFormContainer = document.getElementById('photo-form-container');
    const photoForm = document.getElementById('photo-form');
    const photosGrid = document.getElementById('photos-grid');
    
    const photoViewerModal = document.getElementById('photo-viewer-modal');
    const viewerImg = document.getElementById('viewer-img');
    const viewerTitle = document.getElementById('viewer-title');
    const closePhotoViewerBtn = document.getElementById('close-photo-viewer');
    
    const viewerEditPhotoBtn = document.getElementById('viewer-edit-photo');
    const viewerDeletePhotoBtn = document.getElementById('viewer-delete-photo');

    // 5-1. 사진첩 추가 폼 토글
    if (togglePhotoFormBtn && photoFormContainer) {
        togglePhotoFormBtn.addEventListener('click', () => {
            if (photoFormContainer.style.display === 'none') {
                photoFormContainer.style.display = 'block';
                togglePhotoFormBtn.textContent = '❌ 작성 취소';
                editPhotoTargetId = '';
                photoForm.querySelector('button[type="submit"]').textContent = '사진첩에 등록하기 💖';
            } else {
                photoFormContainer.style.display = 'none';
                togglePhotoFormBtn.textContent = '➕ 사진 추가';
                photoForm.reset();
            }
        });
    }

    // 5-2. 사진첩 추가 카드 클릭 시 폼 토글
    const addPhotoCardBtn = document.getElementById('add-photo-card');
    if (addPhotoCardBtn) {
        addPhotoCardBtn.addEventListener('click', () => {
            if (photoFormContainer && photoFormContainer.style.display === 'none') {
                photoFormContainer.style.display = 'block';
                if (togglePhotoFormBtn) togglePhotoFormBtn.textContent = '❌ 작성 취소';
                editPhotoTargetId = '';
                photoForm.querySelector('button[type="submit"]').textContent = '사진첩에 등록하기 💖';
            }
            if (photoFormContainer) {
                photoFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // 5-3. 사진 뷰어 닫기
    if (closePhotoViewerBtn) {
        closePhotoViewerBtn.addEventListener('click', closePhotoViewer);
    }
    if (photoViewerModal) {
        photoViewerModal.addEventListener('click', (e) => {
            if (e.target === photoViewerModal) {
                closePhotoViewer();
            }
        });
    }
    function closePhotoViewer() {
        if (photoViewerModal) {
            photoViewerModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // 5-4. 사진첩 원본 뷰어 띄우기 함수
    function openPhotoViewer(src, title) {
        if (!photoViewerModal || !viewerImg || !viewerTitle) return;
        
        viewerImg.src = src;
        viewerTitle.textContent = title;
        photoViewerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 5-5. 사진첩 렌더링 및 로컬스토리지 저장 연동
    function updatePhotoAlbum() {
        if (!photosGrid) return;
        
        photosGrid.innerHTML = `
            <div class="photo-card add-card" id="add-photo-card">
                <div class="add-card-icon">➕</div>
                <p>새 사진 올리기</p>
            </div>
        `;

        const addCardNode = document.getElementById('add-photo-card');
        if (addCardNode) {
            addCardNode.addEventListener('click', () => {
                if (photoFormContainer && photoFormContainer.style.display === 'none') {
                    photoFormContainer.style.display = 'block';
                    if (togglePhotoFormBtn) togglePhotoFormBtn.textContent = '❌ 작성 취소';
                }
                if (photoFormContainer) {
                    photoFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        const defaultPhotos = [
            { id: 'default-p-1', src: 'images/read_in_park.jpg', title: '햇살 좋은 날, 공원에서 독서 🌳' },
            { id: 'default-p-2', src: 'images/newyork_1.jpg', title: '비 오는 뉴욕 타임스퀘어 🗽' },
            { id: 'default-p-3', src: 'images/chess_3.jpg', title: '체스 대회, 초집중 모드! 🏆' },
            { id: 'default-p-4', src: 'images/harrypotter_1.jpg', title: '브로드웨이 해리포터 연극 ⚡' },
            { id: 'default-p-5', src: 'images/stpatrick_1.jpg', title: '뉴욕 세인트 패트릭 대성당 ⛪' },
            { id: 'default-p-6', src: 'images/chess_2.jpg', title: '체스 경기 중 묘수 찾기 ♟️' },
            { id: 'default-p-7', src: 'images/stpatrick_2.jpg', title: '성당 앞에서 찰칵! 📸' },
            { id: 'default-p-8', src: 'images/harrypotter_2.jpg', title: '공연 시작 전 기대 가득! 😍' },
            { id: 'default-p-9', src: 'images/read_in_park2.jpg', title: '호수 근처에서 힐링 타임 🍃' },
            { id: 'default-p-10', src: 'images/chess_1.jpg', title: '체스 대회 시상대에서 🏆' },
            { id: 'default-p-11', src: 'images/newyork_2.jpg', title: '뉴욕의 멋진 빌딩 숲 🏢' },
            { id: 'default-p-12', src: 'images/harrypotter_3.jpg', title: '마법의 호그와트 성 성곽 🏰' },
            { id: 'default-p-13', src: 'images/hero.png', title: '수아의 다이어리 홈 일러스트 🎨' }
        ];

        const deletedPhotosStr = localStorage.getItem('deleted_default_photos');
        const deletedDefaultPhotoIds = deletedPhotosStr ? JSON.parse(deletedPhotosStr) : [];

        // 기본 사진 수정 내역
        const editedDefaultPhotosStr = localStorage.getItem('edited_default_photos');
        const editedDefaultPhotos = editedDefaultPhotosStr ? JSON.parse(editedDefaultPhotosStr) : {};

        const filteredDefaults = defaultPhotos.filter(p => !deletedDefaultPhotoIds.includes(p.id));
        filteredDefaults.forEach(p => {
            if (editedDefaultPhotos[p.id]) {
                p.title = editedDefaultPhotos[p.id].title;
                p.src = editedDefaultPhotos[p.id].src;
            }
        });

        const savedPhotosStr = localStorage.getItem('custom_photos');
        const customPhotos = savedPhotosStr ? JSON.parse(savedPhotosStr) : [];

        const allPhotos = [...customPhotos, ...filteredDefaults];

        allPhotos.forEach(photo => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            const cardId = photo.id || `custom-p-${Date.now()}`;
            card.setAttribute('data-id', cardId);
            card.innerHTML = `
                <img src="${photo.src}" alt="${escapeHtml(photo.title)}">
                <div class="photo-overlay">
                    <h4>${escapeHtml(photo.title)}</h4>
                </div>
            `;
            
            card.addEventListener('click', () => {
                openPhotoViewer(photo.src, photo.title);
                currentSelectedPhotoSrc = cardId;
            });

            photosGrid.appendChild(card);
        });
    }

    // 5-6. 사진첩 추가 폼 제출 핸들러 (수정 분기 및 Base64 변환 저장)
    if (photoForm) {
        photoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('photo-title').value.trim();
            const fileInput = document.getElementById('photo-file');
            
            const submitPhoto = (imageSrc) => {
                if (editPhotoTargetId) {
                    // [사진 수정 모드]
                    if (editPhotoTargetId.startsWith('default-')) {
                        // 1. 기본 사진 제목/파일 수정 저장
                        const editedDefaultPhotosStr = localStorage.getItem('edited_default_photos');
                        const editedDefaultPhotos = editedDefaultPhotosStr ? JSON.parse(editedDefaultPhotosStr) : {};
                        
                        let finalSrc = imageSrc;
                        if (!finalSrc) {
                            const originalCard = document.querySelector(`.photo-card[data-id="${editPhotoTargetId}"]`);
                            const origImg = originalCard ? originalCard.querySelector('img') : null;
                            if (origImg) finalSrc = origImg.src;
                        }

                        editedDefaultPhotos[editPhotoTargetId] = {
                            id: editPhotoTargetId, title, src: finalSrc
                        };
                        localStorage.setItem('edited_default_photos', JSON.stringify(editedDefaultPhotos));
                    } else {
                        // 2. 커스텀 사진 수정 저장
                        const savedPhotosStr = localStorage.getItem('custom_photos');
                        const customPhotos = savedPhotosStr ? JSON.parse(savedPhotosStr) : [];
                        
                        let finalSrc = imageSrc;
                        const targetObj = customPhotos.find(p => p.id === editPhotoTargetId);
                        if (!finalSrc && targetObj) {
                            finalSrc = targetObj.src;
                        }

                        customPhotos.forEach(p => {
                            if (p.id === editPhotoTargetId) {
                                p.title = title;
                                p.src = finalSrc;
                            }
                        });
                        localStorage.setItem('custom_photos', JSON.stringify(customPhotos));
                    }
                    editPhotoTargetId = '';
                    photoForm.querySelector('button[type="submit"]').textContent = '사진첩에 등록하기 💖';
                } else {
                    // [신규 사진 등록 모드]
                    const id = `custom-p-${Date.now()}`;
                    const newPhoto = { id, title, src: imageSrc };
                    
                    const savedPhotosStr = localStorage.getItem('custom_photos');
                    const customPhotos = savedPhotosStr ? JSON.parse(savedPhotosStr) : [];
                    customPhotos.unshift(newPhoto);
                    localStorage.setItem('custom_photos', JSON.stringify(customPhotos));
                }

                photoForm.reset();
                photoFormContainer.style.display = 'none';
                if (togglePhotoFormBtn) togglePhotoFormBtn.textContent = '➕ 사진 추가';

                updatePhotoAlbum();
            };

            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    submitPhoto(event.target.result);
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                // 사진 수정 시 파일을 새로 지정하지 않은 경우
                submitPhoto('');
            }
        });
    }

    // 5-7. 사진 뷰어 내 "사진 삭제" 버튼 동작
    if (viewerDeletePhotoBtn) {
        viewerDeletePhotoBtn.addEventListener('click', () => {
            if (!currentSelectedPhotoSrc) return;
            if (confirm('이 사진을 사진첩에서 정말 삭제하시겠어요? 😢')) {
                const targetId = currentSelectedPhotoSrc;
                
                if (targetId.startsWith('default-')) {
                    const deletedPhotosStr = localStorage.getItem('deleted_default_photos');
                    const deletedDefaultPhotoIds = deletedPhotosStr ? JSON.parse(deletedPhotosStr) : [];
                    deletedDefaultPhotoIds.push(targetId);
                    localStorage.setItem('deleted_default_photos', JSON.stringify(deletedDefaultPhotoIds));
                } else {
                    const savedPhotosStr = localStorage.getItem('custom_photos');
                    const customPhotos = savedPhotosStr ? JSON.parse(savedPhotosStr) : [];
                    const filtered = customPhotos.filter(p => p.id !== targetId);
                    localStorage.setItem('custom_photos', JSON.stringify(filtered));
                }

                updatePhotoAlbum();
                closePhotoViewer();
                currentSelectedPhotoSrc = '';
            }
        });
    }

    // 5-8. 사진 뷰어 내 "사진 수정" 버튼 동작
    if (viewerEditPhotoBtn) {
        viewerEditPhotoBtn.addEventListener('click', () => {
            if (!currentSelectedPhotoSrc) return;
            
            editPhotoTargetId = currentSelectedPhotoSrc;
            
            // 기존 제목 정보 가져오기
            let currentTitle = '';
            const targetCard = document.querySelector(`.photo-card[data-id="${editPhotoTargetId}"]`);
            if (targetCard) {
                currentTitle = targetCard.querySelector('h4').textContent;
            }

            // 폼에 제목 채워넣기
            document.getElementById('photo-title').value = currentTitle;
            
            // 사진 파일은 선택 필수 해제(수정 시 파일 유지 지원)
            document.getElementById('photo-file').required = false;

            // 폼 오픈
            closePhotoViewer();
            photoFormContainer.style.display = 'block';
            if (togglePhotoFormBtn) togglePhotoFormBtn.textContent = '❌ 수정 취소';
            photoForm.querySelector('button[type="submit"]').textContent = '사진 수정 완료 💖';
            
            // 스크롤 이동
            photoFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }


    /* ==========================================
       5.9 방명록 실시간 저장/삭제/수정 고도화
       ========================================== */
    // 기존 선언된 guestbookList, guestbookForm, messageCountSpan 을 재사용합니다.

    // 방명록 카드 DOM 추가 헬퍼 함수
    function addGuestbookCardToDOM(cardData, prepend = true) {
        if (!guestbookList) return;

        const newCard = document.createElement('div');
        newCard.className = 'guestbook-card';
        newCard.setAttribute('data-id', cardData.id);

        newCard.innerHTML = `
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <span class="guest-name">${escapeHtml(cardData.nickname)}</span>
                    <span class="guest-date">${escapeHtml(cardData.date)}</span>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="edit-gb-btn" style="background: none; border: none; font-size: 1rem; color: #ffb347; cursor: pointer; padding: 0 5px;" title="방명록 수정">✏️</button>
                    <button class="delete-gb-btn" style="background: none; border: none; font-size: 1.2rem; color: #ff477e; cursor: pointer; padding: 0 5px;" title="방명록 삭제">&times;</button>
                </div>
            </div>
            <p class="guest-msg">${escapeHtml(cardData.message)}</p>
        `;

        // 1) 방명록 수정 리스너 연결
        newCard.querySelector('.edit-gb-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const id = cardData.id;
            
            // 기존 데이터 추출
            let currentNickname = newCard.querySelector('.guest-name').textContent;
            let currentMessage = newCard.querySelector('.guest-msg').textContent;
            
            const newNickname = prompt('수정할 작성자 닉네임을 적어주세요:', currentNickname);
            if (newNickname === null) return; // 취소됨
            if (!newNickname.trim()) {
                alert('닉네임은 빈칸으로 지정할 수 없습니다.');
                return;
            }

            const newMsg = prompt('수정할 한 줄 메시지를 적어주세요:', currentMessage);
            if (newMsg === null) return; // 취소됨
            if (!newMsg.trim()) {
                alert('메시지 내용은 빈칸으로 지정할 수 없습니다.');
                return;
            }

            // 돔 내용 갱신
            newCard.querySelector('.guest-name').textContent = newNickname.trim();
            newCard.querySelector('.guest-msg').textContent = newMsg.trim();

            // 저장소 갱신
            if (id.startsWith('default-gb-')) {
                // 기본 방명록 수정
                const editedGbStr = localStorage.getItem('edited_default_guestbook');
                const editedGb = editedGbStr ? JSON.parse(editedGbStr) : {};
                
                editedGb[id] = { id, nickname: newNickname.trim(), message: newMsg.trim() };
                localStorage.setItem('edited_default_guestbook', JSON.stringify(editedGb));
            } else {
                // 커스텀 방명록 수정
                const saved = localStorage.getItem('custom_guestbook');
                const list = saved ? JSON.parse(saved) : [];
                list.forEach(g => {
                    if (g.id === id) {
                        g.nickname = newNickname.trim();
                        g.message = newMsg.trim();
                    }
                });
                localStorage.setItem('custom_guestbook', JSON.stringify(list));
            }
        });

        // 2) 방명록 삭제 리스너 연결
        newCard.querySelector('.delete-gb-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('이 방명록 글을 삭제하시겠어요? 😢')) {
                newCard.remove();

                const id = cardData.id;
                if (id.startsWith('default-gb-')) {
                    const deletedStr = localStorage.getItem('deleted_default_guestbook');
                    const deletedIds = deletedStr ? JSON.parse(deletedStr) : [];
                    deletedIds.push(id);
                    localStorage.setItem('deleted_default_guestbook', JSON.stringify(deletedIds));
                } else {
                    const saved = localStorage.getItem('custom_guestbook');
                    const list = saved ? JSON.parse(saved) : [];
                    const filtered = list.filter(g => g.id !== id);
                    localStorage.setItem('custom_guestbook', JSON.stringify(filtered));
                }

                updateGuestbookCount();
            }
        });

        if (prepend && guestbookList.firstChild) {
            guestbookList.insertBefore(newCard, guestbookList.firstChild);
        } else {
            guestbookList.appendChild(newCard);
        }
    }

    function updateGuestbookCount() {
        if (!messageCountSpan) return;
        const visibleCards = document.querySelectorAll('#guestbook-list .guestbook-card');
        messageCountSpan.textContent = visibleCards.length;
    }

    function loadGuestbook() {
        const deletedStr = localStorage.getItem('deleted_default_guestbook');
        const deletedDefaultGbIds = deletedStr ? JSON.parse(deletedStr) : [];

        // 수정된 기본 방명록 데이터 로드
        const editedGbStr = localStorage.getItem('edited_default_guestbook');
        const editedDefaultGb = editedGbStr ? JSON.parse(editedGbStr) : {};

        const staticGbCards = document.querySelectorAll('#guestbook-list .guestbook-card');
        staticGbCards.forEach(card => {
            const id = card.getAttribute('data-id');
            if (deletedDefaultGbIds.includes(id)) {
                card.remove();
            } else {
                // 수정 사항이 있는 경우 오버라이딩
                if (editedDefaultGb[id]) {
                    card.querySelector('.guest-name').textContent = editedDefaultGb[id].nickname;
                    card.querySelector('.guest-msg').textContent = editedDefaultGb[id].message;
                }

                const header = card.querySelector('.card-header');
                if (header && !card.querySelector('.delete-gb-btn')) {
                    header.style.display = 'flex';
                    header.style.justify = 'space-between';
                    header.style.alignItems = 'center';
                    header.style.width = '100%';

                    const btnContainer = document.createElement('div');
                    btnContainer.style.display = 'flex';
                    btnContainer.style.gap = '5px';

                    // 수정 ✏️ 버튼 추가
                    const editBtn = document.createElement('button');
                    editBtn.className = 'edit-gb-btn';
                    editBtn.style.background = 'none';
                    editBtn.style.border = 'none';
                    editBtn.style.fontSize = '1rem';
                    editBtn.style.color = '#ffb347';
                    editBtn.style.cursor = 'pointer';
                    editBtn.style.padding = '0 5px';
                    editBtn.title = '방명록 수정';
                    editBtn.innerHTML = '✏️';
                    btnContainer.appendChild(editBtn);

                    // 삭제 ❌ 버튼 추가
                    const delBtn = document.createElement('button');
                    delBtn.className = 'delete-gb-btn';
                    delBtn.style.background = 'none';
                    delBtn.style.border = 'none';
                    delBtn.style.fontSize = '1.2rem';
                    delBtn.style.color = '#ff477e';
                    delBtn.style.cursor = 'pointer';
                    delBtn.style.padding = '0 5px';
                    delBtn.title = '방명록 삭제';
                    delBtn.innerHTML = '&times;';
                    btnContainer.appendChild(delBtn);

                    header.appendChild(btnContainer);

                    // 수정 리스너
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        
                        let currentNickname = card.querySelector('.guest-name').textContent;
                        let currentMessage = card.querySelector('.guest-msg').textContent;
                        
                        const newNickname = prompt('수정할 작성자 닉네임을 적어주세요:', currentNickname);
                        if (newNickname === null) return;
                        if (!newNickname.trim()) {
                            alert('닉네임은 빈칸으로 지정할 수 없습니다.');
                            return;
                        }

                        const newMsg = prompt('수정할 한 줄 메시지를 적어주세요:', currentMessage);
                        if (newMsg === null) return;
                        if (!newMsg.trim()) {
                            alert('메시지 내용은 빈칸으로 지정할 수 없습니다.');
                            return;
                        }

                        card.querySelector('.guest-name').textContent = newNickname.trim();
                        card.querySelector('.guest-msg').textContent = newMsg.trim();

                        editedDefaultGb[id] = { id, nickname: newNickname.trim(), message: newMsg.trim() };
                        localStorage.setItem('edited_default_guestbook', JSON.stringify(editedDefaultGb));
                    });

                    // 삭제 리스너
                    delBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('이 방명록 글을 삭제하시겠어요? 😢')) {
                            card.remove();
                            deletedDefaultGbIds.push(id);
                            localStorage.setItem('deleted_default_guestbook', JSON.stringify(deletedDefaultGbIds));
                            updateGuestbookCount();
                        }
                    });
                }
            }
        });

        const saved = localStorage.getItem('custom_guestbook');
        if (saved) {
            const list = JSON.parse(saved);
            list.reverse().forEach(item => {
                addGuestbookCardToDOM(item, true);
            });
            list.reverse();
        }

        updateGuestbookCount();
    }

    if (guestbookForm) {
        const oldForm = guestbookForm;
        const newForm = oldForm.cloneNode(true);
        oldForm.parentNode.replaceChild(newForm, oldForm);

        newForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const nicknameInput = document.getElementById('nickname');
            const messageInput = document.getElementById('message');
            const nickname = nicknameInput.value.trim();
            const message = messageInput.value.trim();
            
            if (!nickname || !message) return;

            const now = new Date();
            const formattedDate = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const id = `custom-gb-${Date.now()}`;

            const newGbData = { id, nickname, date: formattedDate, message };

            addGuestbookCardToDOM(newGbData, true);

            const saved = localStorage.getItem('custom_guestbook');
            const list = saved ? JSON.parse(saved) : [];
            list.unshift(newGbData);
            localStorage.setItem('custom_guestbook', JSON.stringify(list));

            nicknameInput.value = '';
            messageInput.value = '';
            updateGuestbookCount();
            
            const newCard = document.querySelector(`#guestbook-list .guestbook-card[data-id="${id}"]`);
            if (newCard) newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    /* ==========================================
       6. Single Page Application (SPA) 탭 라우터 기능
       ========================================== */
    function handleTabChange() {
        let hash = window.location.hash || '#home';
        if (hash.includes('cookie-planner.html')) return;
        
        const sections = ['#home', '#about', '#gallery', '#photos', '#guestbook'];
        if (!sections.includes(hash)) {
            hash = '#home';
        }
        
        sections.forEach(selector => {
            const sec = document.querySelector(selector);
            if (sec) {
                sec.classList.remove('active');
            }
        });
        
        const activeSection = document.querySelector(hash);
        if (activeSection) {
            activeSection.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        const navLinks = document.querySelectorAll('.nav-menu .nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const hrefAttr = link.getAttribute('href');
            if (hrefAttr === hash || (hash === '#home' && hrefAttr === '#')) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('hashchange', handleTabChange);
    window.addEventListener('load', handleTabChange);
    
    // 초기 함수 기동
    loadSavedDiaries();
    updatePhotoAlbum();
    loadGuestbook();
    handleTabChange();

});
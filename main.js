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
});

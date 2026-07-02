/* ==========================================================================
   수아홈(suahhome.com) 메인 스크립트 (JavaScript)
   홈페이지의 다크 모드 토글과 방명록 실시간 등록을 담당합니다.
   컴퓨터가 어떻게 이 화면들을 작동시키는지 한 줄씩 쉽게 적어두었어요!
   ========================================================================== */

// HTML 문서가 완전히 불러와지면 스크립트 실행
document.addEventListener('DOMContentLoaded', () => {
    
    // -------------------------------------------------------------
    // 관리자 비밀번호 보호 기능 (수아 패밀리 전용 비밀번호)
    // -------------------------------------------------------------
    const ADMIN_PASSWORD = '6262'; // 수아홈 마스터 비밀번호 (필요시 변경 가능)

    function checkAdminPermission() {
        const input = prompt('관리자 비밀번호를 입력해 주세요 🔐');
        if (input === null) return false; // 취소 누른 경우
        if (input === ADMIN_PASSWORD) {
            return true;
        } else {
            alert('비밀번호가 올바르지 않아 관리자 권한이 거부되었습니다! 🙅');
            return false;
        }
    }
    
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

    // ==========================================
    // -------------------------------------------------------------
    // Firebase 초기화 및 설정 (사용자 Config 연동)
    // -------------------------------------------------------------
    const firebaseConfig = {
      apiKey: "AIzaSyC85DTKsENUKGhcGN6SIq4mfoEZnSmazrE",
      authDomain: "suahhome-3151e.firebaseapp.com",
      projectId: "suahhome-3151e",
      storageBucket: "suahhome-3151e.firebasestorage.app",
      messagingSenderId: "198234928791",
      appId: "1:198234928791:web:7049a8b45fcf1d70c5dbd2",
      measurementId: "G-V498W3W9VX"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const storage = firebase.storage();

    // 전역 트래킹 변수
    let currentSelectedDiaryId = '';
    let currentSelectedPhotoSrc = ''; // 실제로는 photoCard 의 id 를 담음
    
    // 수정 모드 상태 변수
    let editDiaryTargetId = '';
    let editPhotoTargetId = '';

    // 실시간 구독용 스토어 데이터
    let dbCustomDiaries = [];
    let dbCustomPhotos = [];
    let dbCustomGuestbook = [];
    let dbDeletedIds = [];
    let dbEditedContents = {};

    // -------------------------------------------------------------
    // 이미지 파일 고압축 Blob 변환 헬퍼 함수 (Storage 용량 절약용)
    // -------------------------------------------------------------
    function compressImageToBlob(file, maxWidth = 1024, quality = 0.75) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // 고압축 JPEG 포맷의 Blob 파일 데이터로 추출
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to Blob conversion failed'));
                        }
                    }, 'image/jpeg', quality);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // -------------------------------------------------------------
    // 기본 정적 데이터셋 정의
    // -------------------------------------------------------------
    const defaultDiaries = [
        { id: 'default-1', date: '2026. 06. 26', title: '드디어 시험 끝! 😆', summary: '친구들이랑 다 같이 떡볶이 먹고 코인 노래방에서 목청껏 부른 행복했던 날!', detail: '중학교에 입학하고 나서 처음으로 치른 시험이라 걱정이 정말 많았어요. 전날 밤새도록 수학이랑 영어를 외우느라 눈이 피곤했는데, 드디어 시험이 모두 끝나서 날아갈 것 같았어요! 민지랑 유진이랑 시험이 끝나자마자 벼르고 벼르던 학교 앞 떡볶이집으로 뛰어가서 마라 떡볶이랑 튀김을 배 터지게 먹었답니다. 그리고 코인 노래방에 가서 최신 댄스 곡부터 잔잔한 팝송까지 거의 목이 쉴 때까지 불렀어요. 오늘 하루는 성적 생각하지 않고 온전히 재미있게 놀았어요. 중학교 생활 중 가장 스트레스가 다 날아간 최고의 하루였습니다!', mediaType: 'emoji', emoji: '🎒', image: '' },
        { id: 'default-2', date: '2026. 06. 20', title: '소품샵 털고 온 날 💸', summary: '새로 나온 고양이 캐릭터 스티커랑 투명 다이어리 커버 득템! 다꾸 열정 충전 완료.', detail: '요즘 SNS에서 핫하다는 동네 감성 소품샵에 다녀왔어요! 예쁜 문구류와 아기자기한 리빙 소품이 가득해서 들어가자마자 눈이 휘둥그레졌답니다. 한참을 고민하다가 내 일기장을 꾸밀 다꾸용품들을 몇 개 샀어요. 특히 제가 정말 좋아하는 귀여운 뚱보 고양이 캐릭터가 그려진 다색 스티커 세트와 반짝이는 펄이 들어간 마스킹 테이프, 그리고 이번 여름 테마의 투명 다이어리 커버를 샀어요. 집에 오자마자 침대 밑에 판을 깔고 산 것들을 하나하나 붙이면서 다이어리를 정리했는데, 제 취향으로 꽉 채워진 다이어리를 보니까 소소하지만 너무 행복하고 뿌듯했어요. 열심히 일기를 써야겠다고 다시 한번 다짐한 날이었어요!', mediaType: 'emoji', emoji: '🛍️', image: '' },
        { id: 'default-3', date: '2026. 06. 15', title: '중학교 첫 동아리 시간!', summary: '평소 눈여겨보던 도서감상반 가입. 조용한 도서실에서 책 냄새 맡으며 한 컷.', detail: "중학교 입학식 날부터 선배들이 추천해주었던 인기 동아리인 '도서감상반'에 드디어 가입해서 첫 활동을 시작했어요! 도서실로 가니 조용하고 차분한 클래식 음악이 흐르고 있었고, 책 냄새가 마음을 되게 편안하게 해 주었어요. 첫 시간에는 선생님께서 앞으로 한 학기 동안 읽고 감상할 책들을 소개해 주셨는데, 제가 읽고 싶었던 판타지 소설도 목록에 있어서 벌써부터 기대가 많이 돼요. 일주일에 한 번씩 이곳에 모여서 서로 책을 읽은 느낌을 이야기하고, 좋아하는 한 줄을 공유하는 시간을 가질 거래요. 평소에 집에서 혼자 책을 읽는 것도 좋아하지만, 친구들과 책으로 수다를 떨 수 있다는 게 너무 신기하고 설레는 첫 동아리 시간이었습니다.", mediaType: 'image', emoji: '', image: 'images/read_in_park.jpg' },
        { id: 'default-4', date: '2026. 06. 09', title: '비 오는 타임스퀘어 ☔', summary: '뉴욕 여행 중 갑자기 쏟아진 비. 화려한 전광판 밑에서 비 구경하기.', detail: '가족들과 뉴욕 여행을 하던 도중, 갑자기 하늘이 어두워지더니 시원한 소나기가 쏟아졌어요! 마침 우리는 화려한 전광판들이 반짝이는 타임스퀘어 한가운데에 있었답니다. 우산을 급하게 펴고 서서 빗방울이 노란 택시 위로 떨어지는 모습을 구경했는데, 오히려 비가 오니까 전광판 불빛들이 젖은 도로에 반사되어 평소보다 훨씬 화려하고 로맨틱해 보였어요. 빗소리와 사람들의 웅성거림, 그리고 웅장한 타임스퀘어의 전경이 잊지 못할 독특한 분위기를 만들어 준 멋진 비 오는 뉴욕의 오후였습니다.', mediaType: 'image', emoji: '', image: 'images/newyork_1.jpg' },
        { id: 'default-5', date: '2026. 06. 02', title: '체스 대회 본선 진출! ♟️', summary: '초집중해서 둔 체스 대국. 치열한 접전 끝에 드디어 본선행 티켓을 땄다!', detail: '몇 달 동안 열심히 방과 후 체스 교실에서 실력을 쌓으며 준비해 온 지역 청소년 체스 대회 예선 날이었어요. 첫 경기 상대부터 실력이 대단해서 심장이 아주 콩닥콩닥 뛰었답니다. 중반부에 퀸을 뺏길 뻔한 큰 위기가 있었지만, 침착하게 나이트를 활용해 묘수를 찾아내어 극적으로 외통수 승리를 거둘 수 있었어요! 내리 3연승을 거두면서 드디어 다음 달에 열리는 본선 진출권을 획득했답니다. 대회가 끝나고 선생님과 부모님께서 정말 잘했다고 안아주셨는데, 그동안 혼자 기보를 보며 치열하게 공부했던 노력들이 보상받는 기분이라 가슴이 벅차오른 뿌듯한 하루였습니다.', mediaType: 'image', emoji: '', image: 'images/chess_3.jpg' },
        { id: 'default-6', date: '2026. 05. 28', title: '뮤지컬 해리포터 관람 ⚡', summary: '오랫동안 기다렸던 연극! 마법 효과들이 눈앞에서 실시간으로 펼쳐져서 소름.', detail: "좋아하는 소설이자 영화인 '해리포터와 저주받은 아이' 연극 공연을 드디어 보러 간 날이었어요! 극장 로비에 들어가자마자 웅장한 그리핀도르 깃발들과 마법 지팡이 굿즈들이 가득해서 마치 제가 정말로 호그와트에 온 것 같은 착각이 들었답니다. 무대 위의 특수 효과들은 상상 그 이상이었어요. 사람들이 물속으로 뿅 사라지거나, 지팡이 끝에서 실제로 불꽃이 튀고 디멘터들이 객석 머리 위로 날아다닐 때마다 온몸에 소름이 돋았어요! 배우들의 실감 나는 연기력과 몰입감 넘치는 마법 같은 무대 연출 덕분에 5시간에 달하는 긴 러닝타임이 5분처럼 느껴진 평생 기억에 남을 꿈같은 문화생활 날이었습니다.", mediaType: 'image', emoji: '', image: 'images/harrypotter_1.jpg' },
        { id: 'default-7', date: '2026. 05. 20', title: '세인트 패트릭 성당 방문', summary: '뉴욕 한복판에 우뚝 솟은 고딕 양식 성당. 거대한 스테인드글라스에 압도당함.', detail: '뉴욕 5번가를 걷다가 현대적인 빌딩들 사이에 우뚝 솟아 있는 거대한 석조 건물인 세인트 패트릭 대성당에 들어갔어요. 문을 열고 한 걸음 들어가자마자 바깥의 시끄러운 경적 소리가 뚝 끊기고, 웅장하고 성스러운 공기가 온몸을 감쌌답니다. 하늘 높이 솟아 있는 뾰족한 천장 아치들과 벽면을 가득 채운 화려한 스테인드글라스를 통해 들어오는 은은한 무지갯빛 햇살이 너무 신비롭고 아름다웠어요. 한쪽에 마련된 촛대에 작은 초를 하나 밝히고 가족들의 건강과 나의 소소한 소원들을 빌며 조용히 마음을 가다듬는 경건하고 차분한 힐링의 시간을 보냈습니다.', mediaType: 'image', emoji: '', image: 'images/stpatrick_1.jpg' },
        { id: 'default-8', date: '2026. 05. 14', title: '체스 경기 복기하는 중 💭', summary: '패배한 판 분석하기. 상대방의 비숍 전술에 당했지만 다음엔 안 져!', detail: '어제 동아리 대국에서 아쉽게 패배했던 체스 판을 오늘 집 책상에서 혼자 조용히 복기해 보았어요. 당시에는 몰랐는데, 비숍을 킹사이드로 성급하게 전진시켰던 게 상대방 룩에게 중앙 통로를 통째로 내주는 결정적인 패착이었더라고요. 폰 구조를 무너뜨리지 않으면서 차분히 캐슬링을 먼저 해두었더라면 어땠을까 하는 아쉬움이 남았지만, 패배 원인을 정확히 짚어냈으니 다음 대국에서는 똑같은 실수를 하지 않을 거예요! 체스는 이길 때보다 질 때 배우는 게 더 많다는 선생님의 말씀이 마음에 와닿은, 한층 더 진지하게 성장한 하루였습니다.', mediaType: 'image', emoji: '', image: 'images/chess_2.jpg' },
        { id: 'default-9', date: '2026. 05. 08', title: '뉴욕 스트리트 한복판에서 📸', summary: '노란 옐로우캡과 고층 빌딩들. 어디를 찍어도 한 폭의 엽서 같은 멋진 뉴욕.', detail: '뉴욕의 5번가를 가족들과 천천히 걷다가, 햇살이 고층 빌딩 틈새로 쏟아지는 사거리 횡단보도 앞에서 멈춰 섰어요. 길가에는 뉴욕의 상징인 노란 택시들이 줄지어 빵빵거리며 달리고 있고, 전 세계에서 온 다양한 사람들이 바쁘게 걸어가고 있었는데 그 열기 가득한 분위기가 저를 너무 신나게 만들었어요! 마침 빌딩 숲 위로 파란 하늘이 너무 맑게 드러나서 신호등 기둥 옆에 서서 환하게 웃으며 인생샷 한 장을 남겼답니다. 어딜 가나 영화 속 스크린에 들어와 있는 듯한 기분을 안겨주는 뉴욕 거리의 멋진 순간이었습니다.', mediaType: 'image', emoji: '', image: 'images/stpatrick_2.jpg' },
        { id: 'default-10', date: '2026. 05. 01', title: '해리포터 오리지널 굿즈 쇼핑 🛍️', summary: '극장 굿즈 매장에서 그리핀도르 목도리랑 지팡이 구매! 나도 이제 마법사.', detail: '뮤지컬 해리포터 공연이 끝나고 흥분이 채 가시지 않은 상태에서 극장 내 공식 기념품 샵으로 향했어요! 진열대에는 캐릭터별 마법 지팡이와 호그와트 기숙사 유니폼들이 가득해서 지갑을 yer지 않을 수가 없었답니다. 고민 끝에 제가 가장 좋아하는 기숙사인 그리핀도르의 상징색인 붉은색과 금색이 번갈아 들어간 따뜻한 털목도리와 주인공 해리포터의 마법 지팡이를 샀어요. 목도리를 목에 칭칭 감고 지팡이를 손에 쥐고 포즈를 취하니까 정말로 9와 4분의 3 승강장을 통과한 마법사가 된 것처럼 하루 종일 행복했습니다.', mediaType: 'image', emoji: '', image: 'images/harrypotter_2.jpg' },
        { id: 'default-11', date: '2026. 04. 25', title: '날씨 좋은 날 공원 나들이 🍃', summary: '호숫가 벤치에 앉아서 시원한 바람맞기. 책 한 권 들고 힐링하기 딱 좋은 곳.', detail: '주말 아침, 따스한 봄 햇살이 방 안까지 가득 들어와서 근처 호수공원으로 돗자리와 책을 챙겨 나갔어요. 푸른 잔디밭 위에 자리를 펴고 엎드려서 평소에 바빠서 읽지 못했던 판타지 소설책을 펼쳤는데, 호수 위로 살랑살랑 불어오는 시원한 바람 덕분에 집중이 참 잘 되었답니다. 귓가에는 지저귀는 새소리와 강아지와 노는 아이들의 웃음소리가 은은하게 들려오고, 풀 내음이 가득해서 그냥 누워만 있어도 스트레스가 다 녹아내리는 기분이었어요. 특별한 일을 하지 않아도 온전히 쉴 수 있었던, 소소하지만 완벽한 주말 힐링 타임이었습니다.', mediaType: 'image', emoji: '', image: 'images/read_in_park2.jpg' },
        { id: 'default-12', date: '2026. 04. 18', title: '어릴 때 타던 그네 타기 😸', summary: '오랜만에 놀이터에서 신나게 그네 타며 하늘 높이 오르기. 동심으로 복귀!', detail: '학원 수업이 끝나고 집으로 걸어오는 길에, 단지 안 초등학교 앞 놀이터에 들러 오랜만에 그네에 앉았어요. 초등학생 때 친구들이랑 누가 더 높이 가나 시합하며 탔던 기억이 새록새록 떠올랐답니다. 발을 힘차게 구르며 앞으로 나아갈 때마다 얼굴을 스치는 시원한 저녁 바람과 몸이 붕 뜨는 짜릿한 기분이 너무 상쾌했어요! 가장 높은 정점에 도달했을 때 눈앞에 펼쳐진 붉은 노을빛 하늘이 참 아름다웠답니다. 바쁜 일상 속에서 잠시 어릴 적 아무 걱정 없던 동심으로 돌아가 활짝 웃을 수 있었던, 기분 좋은 쉼표 같은 저녁이었습니다.', mediaType: 'emoji', emoji: '😸', image: '' }
    ];

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

    const defaultGuestbook = [
        { id: 'default-gb-1', nickname: '민지 (단짝친구)', date: '2026. 06. 28 16:30', message: '수아야! 미니홈피 만든 거 완전 축하해! 💖 디자인 너무 핑키핑키하고 이쁘다. 앞으로 일기 자주 올려줘! 내일 떡볶이 콜? 😆' },
        { id: 'default-gb-2', nickname: '삼촌', date: '2026. 06. 27 20:15', message: '우리 수아가 벌써 이렇게 훌륭한 홈페이지도 직접 꾸미고 대단한걸? 멋진 일기들로 알차게 가득 채워나가길 응원한다! 최고최고 👍' }
    ];

    // -------------------------------------------------------------
    // 데이터 실시간 수신 리스너 (Firebase)
    // -------------------------------------------------------------
    
    db.collection('deleted_ids').onSnapshot(snapshot => {
        dbDeletedIds = snapshot.docs.map(doc => doc.id);
        renderAll();
    });

    db.collection('edited_contents').onSnapshot(snapshot => {
        dbEditedContents = {};
        snapshot.docs.forEach(doc => {
            dbEditedContents[doc.id] = doc.data();
        });
        renderAll();
    });

    db.collection('custom_diaries').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        dbCustomDiaries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderAll();
    });

    db.collection('custom_photos').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        dbCustomPhotos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderAll();
    });

    db.collection('custom_guestbook').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        dbCustomGuestbook = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderAll();
    });

    function renderAll() {
        renderDiaries();
        renderPhotos();
        renderGuestbook();
    }

    // -------------------------------------------------------------
    // 4. 다이어리 직접 쓰기 및 수정 (Firebase Storage 연동 + 용량 압축 Blob 업로드)
    // -------------------------------------------------------------
    const toggleFormBtn = document.getElementById('toggle-diary-form');
    const formContainer = document.getElementById('diary-form-container');
    const diaryForm = document.getElementById('diary-form');
    const mediaTypeSelect = document.getElementById('diary-media-type');
    const imageGroup = document.getElementById('image-url-group');
    const emojiGroup = document.getElementById('emoji-group');
    const galleryGrid = document.querySelector('.gallery-grid');
    
    const modalEditDiaryBtn = document.getElementById('modal-edit-diary');
    const modalDeleteDiaryBtn = document.getElementById('modal-delete-diary');

    if (toggleFormBtn && formContainer) {
        toggleFormBtn.addEventListener('click', () => {
            if (formContainer.style.display === 'none') {
                formContainer.style.display = 'block';
                toggleFormBtn.textContent = '❌ 작성 취소';
                
                const now = new Date();
                const formattedToday = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}`;
                document.getElementById('diary-date').value = formattedToday;
                
                editDiaryTargetId = '';
                diaryForm.querySelector('button[type="submit"]').textContent = '등록하기 💖';
            } else {
                formContainer.style.display = 'none';
                toggleFormBtn.textContent = '✏️ 새 일기 쓰기';
                diaryForm.reset();
            }
        });
    }

    const addDiaryCard = document.getElementById('add-diary-card');
    if (addDiaryCard) {
        addDiaryCard.addEventListener('click', () => {
            if (formContainer && formContainer.style.display === 'none') {
                formContainer.style.display = 'block';
                if (toggleFormBtn) toggleFormBtn.textContent = '❌ 작성 취소';
                
                const now = new Date();
                const formattedToday = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}`;
                document.getElementById('diary-date').value = formattedToday;
                
                editDiaryTargetId = '';
                diaryForm.querySelector('button[type="submit"]').textContent = '등록하기 💖';
            }
            if (formContainer) {
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

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

    function renderDiaries() {
        if (!galleryGrid) return;
        
        galleryGrid.innerHTML = '';

        const visibleDefaults = defaultDiaries.filter(d => !dbDeletedIds.includes(d.id)).map(d => {
            if (dbEditedContents[d.id]) {
                return { ...d, ...dbEditedContents[d.id] };
            }
            return d;
        });

        const allDiaries = [...dbCustomDiaries, ...visibleDefaults];

        allDiaries.forEach(diary => {
            const card = document.createElement('div');
            card.className = 'gallery-item';
            card.setAttribute('data-id', diary.id);
            card.setAttribute('data-detail', diary.detail);

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
                let randomGrad = gradients[0];
                const charCodeSum = diary.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                randomGrad = gradients[charCodeSum % gradients.length];
                
                mediaHtml = `
                    <div class="gallery-emoji-placeholder" style="background: ${randomGrad};">
                        <span>${escapeHtml(diary.emoji)}</span>
                    </div>
                `;
            }

            card.innerHTML = `
                ${mediaHtml}
                <div class="gallery-info">
                    <span class="date">${escapeHtml(diary.date)}</span>
                    <h4>${escapeHtml(diary.title)}</h4>
                    <p>${escapeHtml(diary.summary)}</p>
                </div>
            `;

            card.addEventListener('click', () => {
                currentSelectedDiaryId = diary.id;
                
                if (diary.mediaType === 'image') {
                    modalImg.style.display = 'block';
                    modalImg.src = diary.image;
                    modalImg.alt = diary.title;
                    modalEmojiPlaceholder.style.display = 'none';
                } else {
                    modalImg.style.display = 'none';
                    modalEmojiPlaceholder.style.display = 'flex';
                    const placeholder = card.querySelector('.gallery-emoji-placeholder');
                    modalEmojiPlaceholder.style.background = placeholder ? placeholder.style.background : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
                    modalEmoji.textContent = diary.emoji;
                }

                modalDate.textContent = diary.date;
                modalTitle.textContent = diary.title;
                modalDesc.textContent = diary.detail;

                diaryModal.classList.add('show');
                document.body.style.overflow = 'hidden';
                history.pushState({ modal: 'diary' }, '');
            });

            galleryGrid.appendChild(card);
        });
    }

    if (diaryForm) {
        diaryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!checkAdminPermission()) return;

            const submitBtn = diaryForm.querySelector('button[type="submit"]');
            submitBtn.textContent = '업로드 중... ☁️';
            submitBtn.disabled = true;

            const date = document.getElementById('diary-date').value.trim();
            const title = document.getElementById('diary-title').value.trim();
            const summary = document.getElementById('diary-summary').value.trim();
            const mediaType = mediaTypeSelect.value;
            const emoji = document.getElementById('diary-emoji').value.trim() || '😸';
            const detail = document.getElementById('diary-detail').value.trim();
            const fileInput = document.getElementById('diary-image-file');

            try {
                let imageUrl = '';
                
                if (mediaType === 'image' && fileInput.files && fileInput.files[0]) {
                    // 고압축 리사이징을 거친 Blob 파일 생성
                    const file = fileInput.files[0];
                    const compressedBlob = await compressImageToBlob(file, 1024, 0.75);
                    
                    const ref = storage.ref().child('diaries/' + Date.now() + '.jpg');
                    const snapshot = await ref.put(compressedBlob);
                    imageUrl = await snapshot.ref.getDownloadURL();
                }

                if (editDiaryTargetId) {
                    if (editDiaryTargetId.startsWith('default-')) {
                        let finalImage = imageUrl;
                        if (!finalImage && mediaType === 'image') {
                            const original = defaultDiaries.find(d => d.id === editDiaryTargetId);
                            const currentEdited = dbEditedContents[editDiaryTargetId];
                            finalImage = currentEdited ? currentEdited.image : (original ? original.image : '');
                        }
                        
                        await db.collection('edited_contents').doc(editDiaryTargetId).set({
                            id: editDiaryTargetId, date, title, summary, mediaType, image: finalImage, emoji, detail
                        });
                    } else {
                        let finalImage = imageUrl;
                        if (!finalImage && mediaType === 'image') {
                            const original = dbCustomDiaries.find(d => d.id === editDiaryTargetId);
                            finalImage = original ? original.image : '';
                        }
                        await db.collection('custom_diaries').doc(editDiaryTargetId).update({
                            date, title, summary, mediaType, image: finalImage, emoji, detail
                        });
                    }
                    editDiaryTargetId = '';
                    submitBtn.textContent = '등록하기 💖';
                } else {
                    const id = 'custom-' + Date.now();
                    await db.collection('custom_diaries').doc(id).set({
                        id, date, title, summary, mediaType, image: imageUrl, emoji, detail,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                diaryForm.reset();
                formContainer.style.display = 'none';
                if (toggleFormBtn) toggleFormBtn.textContent = '✏️ 새 일기 쓰기';
            } catch (err) {
                console.error(err);
                alert('업로드 중 오류가 발생했습니다: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                if (!editDiaryTargetId) submitBtn.textContent = '등록하기 💖';
            }
        });
    }

    if (modalDeleteDiaryBtn) {
        modalDeleteDiaryBtn.addEventListener('click', async () => {
            if (!currentSelectedDiaryId) return;
            if (!checkAdminPermission()) return;
            if (confirm('이 일기를 정말 삭제하시겠어요? 😢')) {
                try {
                    if (currentSelectedDiaryId.startsWith('default-')) {
                        await db.collection('deleted_ids').doc(currentSelectedDiaryId).set({
                            id: currentSelectedDiaryId,
                            deletedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } else {
                        await db.collection('custom_diaries').doc(currentSelectedDiaryId).delete();
                    }
                    closeModal();
                    currentSelectedDiaryId = '';
                } catch (err) {
                    alert('삭제 중 오류가 발생했습니다: ' + err.message);
                }
            }
        });
    }

    if (modalEditDiaryBtn) {
        modalEditDiaryBtn.addEventListener('click', () => {
            if (!currentSelectedDiaryId) return;
            if (!checkAdminPermission()) return;
            
            editDiaryTargetId = currentSelectedDiaryId;
            
            let targetObj = null;
            if (editDiaryTargetId.startsWith('default-')) {
                targetObj = dbEditedContents[editDiaryTargetId] || defaultDiaries.find(d => d.id === editDiaryTargetId);
            } else {
                targetObj = dbCustomDiaries.find(d => d.id === editDiaryTargetId);
            }

            if (targetObj) {
                document.getElementById('diary-date').value = targetObj.date || '';
                document.getElementById('diary-title').value = targetObj.title || '';
                document.getElementById('diary-summary').value = targetObj.summary || '';
                document.getElementById('diary-detail').value = targetObj.detail || '';
                mediaTypeSelect.value = targetObj.mediaType || 'image';
                document.getElementById('diary-emoji').value = targetObj.emoji || '😸';

                if (targetObj.mediaType === 'image') {
                    imageGroup.style.display = 'block';
                    emojiGroup.style.display = 'none';
                } else {
                    imageGroup.style.display = 'none';
                    emojiGroup.style.display = 'block';
                }

                closeModal();
                formContainer.style.display = 'block';
                if (toggleFormBtn) toggleFormBtn.textContent = '❌ 수정 취소';
                diaryForm.querySelector('button[type="submit"]').textContent = '수정 완료 💖';
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }


    /* ==========================================
       5. 독립적인 사진첩 (Photos) 기능 및 원본 뷰어/수정 (Firebase Storage 연동 + 용량 압축 Blob 업로드)
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

    const addPhotoCardBtn = document.getElementById('add-photo-card');
    if (addPhotoCardBtn) {
        addPhotoCardBtn.addEventListener('click', () => {
            if (photoFormContainer && photoFormContainer.style.display === 'none') {
                photoFormContainer.style.display = 'block';
                if (togglePhotoFormBtn) togglePhotoFormBtn.textContent = '❌ 작성 취소';
                editPhotoTargetId = '';
                photoForm.querySelector('button[type="submit"]').textContent = '사진첩에 등록하기 💖';
            }            if (photoFormContainer) {
                photoFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

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

    function openPhotoViewer(src, title) {
        if (!photoViewerModal || !viewerImg || !viewerTitle) return;
        viewerImg.src = src;
        viewerTitle.textContent = title;
        photoViewerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        history.pushState({ modal: 'photo' }, '');
    }

    function renderPhotos() {
        if (!photosGrid) return;
        
        photosGrid.innerHTML = '';

        const visibleDefaults = defaultPhotos.filter(p => !dbDeletedIds.includes(p.id)).map(p => {
            if (dbEditedContents[p.id]) {
                return { ...p, ...dbEditedContents[p.id] };
            }
            return p;
        });

        const allPhotos = [...dbCustomPhotos, ...visibleDefaults];

        allPhotos.forEach(photo => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.setAttribute('data-id', photo.id);
            card.innerHTML = `
                <img src="${photo.src}" alt="${escapeHtml(photo.title)}">
                <div class="photo-overlay">
                    <h4>${escapeHtml(photo.title)}</h4>
                </div>
            `;
            
            card.addEventListener('click', () => {
                openPhotoViewer(photo.src, photo.title);
                currentSelectedPhotoSrc = photo.id;
            });

            photosGrid.appendChild(card);
        });
    }

    if (photoForm) {
        photoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!checkAdminPermission()) return;

            const submitBtn = photoForm.querySelector('button[type="submit"]');
            submitBtn.textContent = '업로드 중... ☁️';
            submitBtn.disabled = true;

            const title = document.getElementById('photo-title').value.trim();
            const fileInput = document.getElementById('photo-file');

            try {
                let fileUrl = '';
                if (fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    const compressedBlob = await compressImageToBlob(file, 1024, 0.75);
                    
                    const ref = storage.ref().child('photos/' + Date.now() + '.jpg');
                    const snapshot = await ref.put(compressedBlob);
                    fileUrl = await snapshot.ref.getDownloadURL();
                }

                if (editPhotoTargetId) {
                    if (editPhotoTargetId.startsWith('default-')) {
                        let finalSrc = fileUrl;
                        if (!finalSrc) {
                            const original = defaultPhotos.find(p => p.id === editPhotoTargetId);
                            const currentEdited = dbEditedContents[editPhotoTargetId];
                            finalSrc = currentEdited ? currentEdited.src : (original ? original.src : '');
                        }
                        await db.collection('edited_contents').doc(editPhotoTargetId).set({
                            id: editPhotoTargetId, title, src: finalSrc
                        });
                    } else {
                        let finalSrc = fileUrl;
                        if (!finalSrc) {
                            const original = dbCustomPhotos.find(p => p.id === editPhotoTargetId);
                            finalSrc = original ? original.src : '';
                        }
                        await db.collection('custom_photos').doc(editPhotoTargetId).update({
                            title, src: finalSrc
                        });
                    }
                    editPhotoTargetId = '';
                    submitBtn.textContent = '사진첩에 등록하기 💖';
                } else {
                    const id = 'custom-p-' + Date.now();
                    await db.collection('custom_photos').doc(id).set({
                        id, title, src: fileUrl,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                photoForm.reset();
                photoFormContainer.style.display = 'none';
                if (togglePhotoFormBtn) togglePhotoFormBtn.textContent = '➕ 사진 추가';
            } catch (err) {
                alert('업로드 중 에러가 발생했습니다: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                if (!editPhotoTargetId) submitBtn.textContent = '사진첩에 등록하기 💖';
            }
        });
    }

    if (viewerDeletePhotoBtn) {
        viewerDeletePhotoBtn.addEventListener('click', async () => {
            if (!currentSelectedPhotoSrc) return;
            if (!checkAdminPermission()) return;
            if (confirm('이 사진을 사진첩에서 정말 삭제하시겠어요? 😢')) {
                try {
                    if (currentSelectedPhotoSrc.startsWith('default-')) {
                        await db.collection('deleted_ids').doc(currentSelectedPhotoSrc).set({
                            id: currentSelectedPhotoSrc,
                            deletedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } else {
                        await db.collection('custom_photos').doc(currentSelectedPhotoSrc).delete();
                    }
                    closePhotoViewer();
                    currentSelectedPhotoSrc = '';
                } catch (err) {
                    alert('삭제 중 오류가 발생했습니다: ' + err.message);
                }
            }
        });
    }

    if (viewerEditPhotoBtn) {
        viewerEditPhotoBtn.addEventListener('click', () => {
            if (!currentSelectedPhotoSrc) return;
            if (!checkAdminPermission()) return;
            
            editPhotoTargetId = currentSelectedPhotoSrc;
            
            let targetObj = null;
            if (editPhotoTargetId.startsWith('default-')) {
                targetObj = dbEditedContents[editPhotoTargetId] || defaultPhotos.find(p => p.id === editPhotoTargetId);
            } else {
                targetObj = dbCustomPhotos.find(p => p.id === editPhotoTargetId);
            }

            if (targetObj) {
                document.getElementById('photo-title').value = targetObj.title || '';
                document.getElementById('photo-file').required = false;

                closePhotoViewer();
                photoFormContainer.style.display = 'block';
                if (togglePhotoFormBtn) togglePhotoFormBtn.textContent = '❌ 수정 취소';
                photoForm.querySelector('button[type="submit"]').textContent = '사진 수정 완료 💖';
                photoFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }


    /* ==========================================
       5.9 방명록 실시간 저장/삭제/수정 고도화 (Firebase 연동)
       ========================================== */
    // 기존에 선언된 guestbookList, guestbookForm, messageCountSpan 을 재사용합니다.

    function renderGuestbook() {
        if (!guestbookList) return;
        guestbookList.innerHTML = '';

        const visibleDefaults = defaultGuestbook.filter(g => !dbDeletedIds.includes(g.id)).map(g => {
            if (dbEditedContents[g.id]) {
                return { ...g, ...dbEditedContents[g.id] };
            }
            return g;
        });

        const allGuestbook = [...dbCustomGuestbook, ...visibleDefaults];

        allGuestbook.forEach(item => {
            const card = document.createElement('div');
            card.className = 'guestbook-card';
            card.setAttribute('data-id', item.id);

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div>
                        <span class="guest-name">${escapeHtml(item.nickname)}</span>
                        <span class="guest-date">${escapeHtml(item.date)}</span>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="edit-gb-btn" style="background: none; border: none; font-size: 1rem; color: #ffb347; cursor: pointer; padding: 0 5px;" title="방명록 수정">✏️</button>
                        <button class="delete-gb-btn" style="background: none; border: none; font-size: 1.2rem; color: #ff477e; cursor: pointer; padding: 0 5px;" title="방명록 삭제">&times;</button>
                    </div>
                </div>
                <p class="guest-msg">${escapeHtml(item.message)}</p>
            `;

            card.querySelector('.edit-gb-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!checkAdminPermission()) return;
                
                const newNickname = prompt('수정할 작성자 닉네임을 적어주세요:', item.nickname);
                if (newNickname === null) return;
                if (!newNickname.trim()) {
                    alert('닉네임은 필수입니다.');
                    return;
                }

                const newMsg = prompt('수정할 한 줄 메시지를 적어주세요:', item.message);
                if (newMsg === null) return;
                if (!newMsg.trim()) {
                    alert('메시지 내용은 필수입니다.');
                    return;
                }

                try {
                    if (item.id.startsWith('default-')) {
                        await db.collection('edited_contents').doc(item.id).set({
                            id: item.id, nickname: newNickname.trim(), message: newMsg.trim(), date: item.date
                        });
                    } else {
                        await db.collection('custom_guestbook').doc(item.id).update({
                            nickname: newNickname.trim(),
                            message: newMsg.trim()
                        });
                    }
                } catch (err) {
                    alert('수정 중 에러가 발생했습니다: ' + err.message);
                }
            });

            card.querySelector('.delete-gb-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!checkAdminPermission()) return;
                if (confirm('이 방명록 글을 삭제하시겠어요? 😢')) {
                    try {
                        if (item.id.startsWith('default-')) {
                            await db.collection('deleted_ids').doc(item.id).set({
                                id: item.id,
                                deletedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        } else {
                            await db.collection('custom_guestbook').doc(item.id).delete();
                        }
                    } catch (err) {
                        alert('삭제 중 에러가 발생했습니다: ' + err.message);
                    }
                }
            });

            guestbookList.appendChild(card);
        });

        if (messageCountSpan) messageCountSpan.textContent = allGuestbook.length;
    }

    if (guestbookForm) {
        const oldForm = guestbookForm;
        const newForm = oldForm.cloneNode(true);
        oldForm.parentNode.replaceChild(newForm, oldForm);

        newForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const nicknameInput = document.getElementById('nickname');
            const messageInput = document.getElementById('message');
            const nickname = nicknameInput.value.trim();
            const message = messageInput.value.trim();
            
            if (!nickname || !message) return;

            const now = new Date();
            const formattedDate = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const id = 'custom-gb-' + Date.now();

            try {
                await db.collection('custom_guestbook').doc(id).set({
                    id, nickname, date: formattedDate, message,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                nicknameInput.value = '';
                messageInput.value = '';
            } catch (err) {
                alert('등록 중 에러가 발생했습니다: ' + err.message);
            }
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
    
    // 초기 기동
    handleTabChange();

    // 하단 닫기 단추들의 이벤트 위임 연동
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-modal-btn')) {
            closeModal();
            if (history.state && history.state.modal === 'diary') {
                history.back();
            }
        }
        if (e.target.classList.contains('close-viewer-btn')) {
            closePhotoViewer();
            if (history.state && history.state.modal === 'photo') {
                history.back();
            }
        }
    });

    // 스마트폰 하드웨어/제스처 뒤로가기 시 모달창 자동 닫기 처리 (History API)
    window.addEventListener('popstate', (event) => {
        if (diaryModal && diaryModal.classList.contains('show')) {
            closeModal();
        }
        if (photoViewerModal && photoViewerModal.classList.contains('show')) {
            closePhotoViewer();
        }
    });

});
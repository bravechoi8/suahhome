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

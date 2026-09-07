const consoleBox =
    document.getElementById("console");


// =================================
// 공통 실행 함수
// =================================
async function runAction(message, action) {

    consoleBox.textContent =
        message;

    try {

        const result =
            await action();

        consoleBox.textContent =
            result.output;

    } catch (error) {

        consoleBox.textContent =
            "Electron 오류 발생\n\n" +
            error.message;
    }

}


// =================================
// 상태 확인
// =================================
document
    .getElementById("status")
    .addEventListener("click", () => {

        runAction(
            "상태 확인 중...",
            window.blockchain.statusFabric
        );

    });


// =================================
// 전체 시작
// =================================
document
    .getElementById("start")
    .addEventListener("click", () => {

        runAction(
            "Fabric Network와 Gateway를 시작하는 중...",
            window.blockchain.startSystem
        );

    });


// =================================
// 전체 종료
// =================================
document
    .getElementById("stop")
    .addEventListener("click", () => {

        runAction(
            "Gateway와 Fabric Network를 종료하는 중...",
            window.blockchain.stopSystem
        );

    });


// =================================
// Gateway 시작
// =================================
document
    .getElementById("gatewayStart")
    .addEventListener("click", () => {

        runAction(
            "Gateway Server 시작 중...",
            window.blockchain.startGateway
        );

    });


// =================================
// Gateway 종료
// =================================
document
    .getElementById("gatewayStop")
    .addEventListener("click", () => {

        runAction(
            "Gateway Server 종료 중...",
            window.blockchain.stopGateway
        );

    });
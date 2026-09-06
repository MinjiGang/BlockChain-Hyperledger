const {
    app,
    BrowserWindow,
    ipcMain
} = require("electron");

const { execFile } = require("child_process");
const path = require("path");


function createWindow() {

    const win = new BrowserWindow({
        width: 900,
        height: 650,

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile("index.html");
}


// ===============================
// WSL 명령 실행 함수
// ===============================
function runWSL(command) {

    return new Promise((resolve) => {

        execFile(
            "wsl.exe",
            [
                "bash",
                "-lc",
                command
            ],
            {
                encoding: "utf8"
            },
            (error, stdout, stderr) => {

                let output = "";

                if (stdout) {
                    output += stdout;
                }

                if (stderr) {
                    output += "\n" + stderr;
                }

                resolve({
                    success: !error,
                    output:
                        output ||
                        (error ? error.message : "완료")
                });
            }
        );
    });
}


// ===============================
// 상태 확인
// ===============================
ipcMain.handle("fabric-status", async () => {

    return await runWSL(
        "$HOME/iot-blockchain/scripts/status.sh"
    );

});


// ===============================
// 전체 시작
// Fabric → Gateway
// ===============================
ipcMain.handle("system-start", async () => {

    return await runWSL(
        "$HOME/iot-blockchain/scripts/start.sh && " +
        "$HOME/iot-blockchain/scripts/start-gateway.sh"
    );

});


// ===============================
// 전체 종료
// Gateway → Fabric
// ===============================
ipcMain.handle("system-stop", async () => {

    return await runWSL(
        "$HOME/iot-blockchain/scripts/stop-gateway.sh; " +
        "$HOME/iot-blockchain/scripts/stop.sh"
    );

});


// ===============================
// Gateway 시작
// ===============================
ipcMain.handle("gateway-start", async () => {

    return await runWSL(
        "$HOME/iot-blockchain/scripts/start-gateway.sh"
    );

});


// ===============================
// Gateway 종료
// ===============================
ipcMain.handle("gateway-stop", async () => {

    return await runWSL(
        "$HOME/iot-blockchain/scripts/stop-gateway.sh"
    );

});


app.whenReady().then(() => {

    createWindow();

});


app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }

});
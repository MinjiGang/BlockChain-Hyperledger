const {
    contextBridge,
    ipcRenderer
} = require("electron");


contextBridge.exposeInMainWorld(
    "blockchain",
    {

        // 상태 확인
        statusFabric: () =>
            ipcRenderer.invoke("fabric-status"),


        // 전체 시작
        startSystem: () =>
            ipcRenderer.invoke("system-start"),


        // 전체 종료
        stopSystem: () =>
            ipcRenderer.invoke("system-stop"),


        // Gateway 시작
        startGateway: () =>
            ipcRenderer.invoke("gateway-start"),


        // Gateway 종료
        stopGateway: () =>
            ipcRenderer.invoke("gateway-stop")

    }
);
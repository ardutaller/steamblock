/*
 * SteamBlock - Google Drive
 *
 * Integración de Google Drive para SteamBlock.
 * Utiliza Google Identity Services y el alcance drive.file.
 */

(function () {
    "use strict";

    const CLIENT_ID =
        "214450544007-13qjvad0vi01n39k5q9vd1r9r7nacvt9.apps.googleusercontent.com";

    const DRIVE_SCOPE =
        "https://www.googleapis.com/auth/drive.file";

    const DRIVE_API =
        "https://www.googleapis.com/drive/v3";

    const UPLOAD_API =
        "https://www.googleapis.com/upload/drive/v3/files";

    let tokenClient = null;
    let accessToken = null;
    let steamBlockFolderId = null;

    /*
     * Inicializar Google Identity Services
     */
    function initialize() {
        if (
            !window.google ||
            !google.accounts ||
            !google.accounts.oauth2
        ) {
            setTimeout(initialize, 200);
            return;
        }

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: DRIVE_SCOPE,

            callback: function (response) {
                if (response.error) {
                    console.error(
                        "SteamBlock Google Drive:",
                        response
                    );

                    if (window.steamBlockGoogleDriveCallback) {
                        window.steamBlockGoogleDriveCallback(
                            "error",
                            response
                        );
                    }

                    return;
                }

                accessToken = response.access_token;

                console.log(
                    "SteamBlock: Google Drive conectado."
                );

                if (window.steamBlockGoogleDriveCallback) {
                    window.steamBlockGoogleDriveCallback(
                        "connected",
                        null
                    );
                }
            },

            error_callback: function (error) {
                console.error(
                    "SteamBlock Google OAuth:",
                    error
                );

                if (window.steamBlockGoogleDriveCallback) {
                    window.steamBlockGoogleDriveCallback(
                        "error",
                        error
                    );
                }
            }
        });

        console.log(
            "SteamBlock Google Drive: inicializado."
        );
    }


    /*
     * Solicitar autorización
     */
    function connect() {
        if (!tokenClient) {
            console.error(
                "Google Drive todavía no está inicializado."
            );
            return false;
        }

        tokenClient.requestAccessToken({
            prompt: ""
        });

        return true;
    }


    /*
     * Comprobar conexión
     */
    function isConnected() {
        return accessToken !== null;
    }


    /*
     * Revocar autorización
     */
    function disconnect() {
        if (!accessToken) {
            return;
        }

        google.accounts.oauth2.revoke(
            accessToken,
            function () {
                accessToken = null;
                steamBlockFolderId = null;

                console.log(
                    "SteamBlock: acceso a Google Drive revocado."
                );

                if (window.steamBlockGoogleDriveCallback) {
                    window.steamBlockGoogleDriveCallback(
                        "disconnected",
                        null
                    );
                }
            }
        );
    }


    /*
     * Ejecutar una petición autenticada a Drive
     */
    async function driveFetch(url, options) {

        if (!accessToken) {
            throw new Error(
                "SteamBlock no está conectado a Google Drive."
            );
        }

        options = options || {};

        options.headers = Object.assign(
            {},
            options.headers || {},
            {
                Authorization:
                    "Bearer " + accessToken
            }
        );

        const response =
            await fetch(url, options);

        if (!response.ok) {
            const text =
                await response.text();

            throw new Error(
                response.status +
                " " +
                response.statusText +
                "\n" +
                text
            );
        }

        return response;
    }


    /*
     * Buscar la carpeta SteamBlock
     */
    async function findSteamBlockFolder() {

        const query =
            "name = 'SteamBlock'" +
            " and mimeType = " +
            "'application/vnd.google-apps.folder'" +
            " and trashed = false";

        const url =
            DRIVE_API +
            "/files?q=" +
            encodeURIComponent(query) +
            "&spaces=drive" +
            "&fields=files(id,name)";

        const response =
            await driveFetch(url);

        const data =
            await response.json();

        if (
            data.files &&
            data.files.length > 0
        ) {
            return data.files[0];
        }

        return null;
    }


    /*
     * Crear carpeta SteamBlock
     */
    async function createSteamBlockFolder() {

        const metadata = {
            name: "SteamBlock",
            mimeType:
                "application/vnd.google-apps.folder"
        };

        const response =
            await driveFetch(
                DRIVE_API + "/files",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(metadata)
                }
            );

        return await response.json();
    }


    /*
     * Obtener o crear la carpeta SteamBlock
     */
    async function getSteamBlockFolder() {

        if (steamBlockFolderId) {
            return {
                id: steamBlockFolderId,
                name: "SteamBlock"
            };
        }

        let folder =
            await findSteamBlockFolder();

        if (!folder) {
            folder =
                await createSteamBlockFolder();
        }

        steamBlockFolderId =
            folder.id;

        return folder;
    }


    /*
     * Listar proyectos de SteamBlock
     */
    async function listFiles() {

        const folder =
            await getSteamBlockFolder();

        const query =
            "'" +
            folder.id +
            "' in parents" +
            " and trashed = false";

        const url =
            DRIVE_API +
            "/files?q=" +
            encodeURIComponent(query) +
            "&orderBy=name" +
            "&fields=" +
            encodeURIComponent(
                "files(id,name,mimeType,size,modifiedTime)"
            );

        const response =
            await driveFetch(url);

        const data =
            await response.json();

        return data.files || [];
    }


    /*
     * Guardar un archivo de texto
     *
     * Más adelante aquí guardaremos directamente
     * los proyectos .ubp de SteamBlock.
     */
    async function saveFile(
        fileName,
        content,
        mimeType
    ) {

        const folder =
            await getSteamBlockFolder();

        const metadata = {
            name: fileName,
            parents: [folder.id],
            mimeType:
                mimeType ||
                "application/octet-stream"
        };

        const boundary =
            "steamblock_boundary_" +
            Date.now();

        const body =
            "--" +
            boundary +
            "\r\n" +
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
            JSON.stringify(metadata) +
            "\r\n" +
            "--" +
            boundary +
            "\r\n" +
            "Content-Type: " +
            metadata.mimeType +
            "\r\n\r\n" +
            content +
            "\r\n" +
            "--" +
            boundary +
            "--";

        const response =
            await driveFetch(
                UPLOAD_API +
                "?uploadType=multipart" +
                "&fields=id,name,parents,modifiedTime",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "multipart/related; boundary=" +
                            boundary
                    },

                    body: body
                }
            );

        return await response.json();
    }


    /*
     * Descargar contenido de un archivo
     */
    async function loadFile(fileId) {

        const response =
            await driveFetch(
                DRIVE_API +
                "/files/" +
                encodeURIComponent(fileId) +
                "?alt=media"
            );

        return await response.text();
    }


    /*
     * Exponer la API de SteamBlock
     */
    window.SteamBlockGoogleDrive = {

        initialize: initialize,

        connect: connect,

        disconnect: disconnect,

        isConnected: isConnected,

        getFolder:
            getSteamBlockFolder,

        listFiles:
            listFiles,

        saveFile:
            saveFile,

        loadFile:
            loadFile
    };


    /*
     * Inicializar automáticamente
     */
    initialize();

})();

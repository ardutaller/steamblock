// SteamBlock V43 — firmware installer change required for direct URL loading
// File: ide/MicroBlocksFirmwareInstaller.gp
//
// Add this method immediately after installESPFirmwareFromURL:
//
// method installESPFirmwareFromURLWithURL MicroBlocksFirmwareInstaller url boardName {
//     if (or (isNil url) ('' == (trim url))) { return }
//     if (isNil boardName) { initialize this; boardName = boardType }
//     if (not (contains espBoards boardName)) {
//         inform (localized 'This firmware loader supports ESP boards only.') (localized 'Firmware Install')
//         return
//     }
//     flashESPFirmwareFromURL this boardName (trim url)
// }

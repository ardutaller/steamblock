// SteamBlock V44
// File: ide/MicroBlocksFirmwareInstaller.gp
//
// Añadir este método después de installESPFirmwareFromURL:
//
// method installESPFirmwareFromURLWithURL MicroBlocksFirmwareInstaller url boardName {
//     initialize this
//     if (or (isNil url) ('' == (trim url))) { return }
//     if (isNil boardName) { boardName = boardType }
//     if (not (contains espBoards boardName)) {
//         inform (localized 'This firmware loader supports ESP boards only.') (localized 'Firmware Install')
//         return
//     }
//     flashESPFirmwareFromURL this boardName (trim url)
// }

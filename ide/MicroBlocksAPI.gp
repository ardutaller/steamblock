// SteamBlock V43 — API change required for Tools firmware URL loading
// File: ide/MicroBlocksAPI.gp
//
// Replace the existing board.installVMfromURL branch with:
//
// } (endPoint == 'board.installVMfromURL') {
//     respondAPIRequest this id 0 // respond first so the request is deleted
//     if (and (count params) >= 1 (notNil (at params 1)) ('' != (at params 1))) {
//         url = (at params 1)
//         boardName = nil
//         if ((count params) >= 2) { boardName = (at params 2) }
//         installESPFirmwareFromURLWithURL (new 'MicroBlocksFirmwareInstaller') url boardName
//     } else {
//         installESPFirmwareFromURL (new 'MicroBlocksFirmwareInstaller')
//     }

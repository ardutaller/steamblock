// SteamBlock V44
// File: ide/MicroBlocksAPI.gp
//
// Añadir esta rama junto a los endpoints de Board:
//
// } (endPoint == 'board.installVMfromURLDirect') {
//     respondAPIRequest this id 0 // respond first so the request is deleted
//     url = (at params 1)
//     boardName = (at params 2)
//     installESPFirmwareFromURLWithURL (new 'MicroBlocksFirmwareInstaller') url boardName

TODO
====

[x] Crear un TODO en català perquè no l'entengui ningú més
[x] Afegir classe a blocs alternatius del menu contextual de blocs
[x] Estilitzar ↑↑↑ perquè siguin d'una mida raonable
[x] Impedir selecció del botó del logo (passa a Electron només?)
[x] Botó de graph té classe "active" però al CSS no s'està fent res amb ella
[x] Canvi imatges tips perquè quadrin millor amb el text
[x] Alçada del canvas inconsistent (CSS vs JS?)
[x] Classes d'estat de les script-pane-tools (--disabled)

[x] Cantonada xunga en finestres quan en dark mode
[x] Revisar padding de finestra Graph
[x] Al buscar usos de blocs, els scripts surten gegants. Ja tenen classe --script
[ ] Estilar progress
[ ] Revisar: windowButtons.setAttribute('data-undraggable', true); (a buttons)
[ ] Estilitzar overlay modal amb spinner
[ ] Fer category pane redimensionable (o collapsible)
[ ] Considerar un sol component per a controls de zoom (scripts pane, graph window)


Windows
===
[x] Windows: Quan fas el primer resize es lia un pollastre
[ ] Windows: Alçada mínima d'acord als continguts (moltes no han de ser adaptables)

Opció?
- Decidir dues o tres amplades estàndard de finestra (small, medium, large)
- Un cop tenir l'amplada, podem assignar amb CSS l'alçada (heigth: min-content)


Tips
===
[ ] Revisar textos de tips per a minimitzar problemes d'imatges amb els espais i les puntuacions.
[ ] Proposar la opció d'amagar els tips (Advanced mode?)


Menus
===
[x] Als context menu amb checks que són single option, afegir classe --single-option
[ ] A ↑↑↑, alinear ticks a la dreta i només mostrar el que està actiu
[ ] My Blocks -> Context menu: Show and Hide, or just a check?
[ ] Glitch, al clicar al menú fa un joc estrany amb el ✔

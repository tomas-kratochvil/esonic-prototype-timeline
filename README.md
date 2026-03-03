# Prototyp plánovací aplikace

## Spuštění prototypu

Jednoduše otevřete soubor `index.html` ve webovém prohlížeči.

## Funkce prototypu

### ✅ Implementováno

1. **Drag & Drop**
   - Přetažení receptu z backlogu do kalendáře
   - Přesun naplánovaných položek mezi dny a hodinami
   - Vizuální feedback při přetahování

2. **Vícevrstevné plánování**
   - Týdenní pohled s navigací (předchozí/následující týden)
   - Denní rozložení s hodinami (6:00 - 22:00)
   - Přepočet závislých příkazů

3. **Výrobní recepty**
   - Backlog seznam s filtrací
   - Detail receptu (modal)
   - Uzamčení/odemčení příkazů (locked/unlocked)

4. **Automatika**
   - Přepočet časů při přesunu uzamčených receptů
   - Detekce kolizí (červené zvýraznění)
   - Automatický rozklad na výrobní příkazy

5. **Vizualizace**
   - Barevné rozlišení typů příkazů
   - Legenda
   - Statistiky (naplánováno, backlog, kolize, využití)

6. **UX**
   - Responsivní design
   - Toast notifikace
   - Zvýraznění dnešního dne

### 🚧 Simulováno (pro demo)

- Načítání z Helios (1s delay, mock data)
- Ukládání do Helios (1s delay, console log)
- Filtrování backlogu (připraveno)

## Struktura dat

### Výrobní recept
```javascript
{
  id: 'R001',
  orderId: 'OBJ-2026-001',
  name: 'Ananasový dort 1kg',
  deadline: '2026-02-17',
  locked: true,  // příkazy se posouvají společně
  status: 'backlog', // nebo 'planned'
  commands: [...]
}
```

### Výrobní příkaz
```javascript
{
  id: 'P001',
  type: 'podklad', // podklad, tvaroh, krem, freezer
  offsetDays: -3,  // -3 dny před termínem
  duration: 2      // trvání v hodinách
}
```

### Naplánovaná položka
```javascript
{
  recipeId: 'R001',
  commandId: 'P001',
  type: 'podklad',
  date: '2026-02-14',
  startHour: 8,
  duration: 2
}
```

## Klíčové algoritmy

### Plánování receptu
1. Uživatel přetáhne recept na konkrétní den a hodinu
2. Systém vezme termín dokončení (deadline)
3. Pro každý příkaz vypočítá datum dle offsetDays
4. Vytvoří naplánované položky pro všechny příkazy
5. Překreslí UI

### Přesun naplánované položky
1. Uživatel přetáhne již naplánovanou položku
2. Systém vypočítá rozdíl dnů a hodin
3. Pokud je recept uzamčen (locked=true):
   - Přesune všechny související příkazy o stejný offset
4. Pokud odemčen:
   - Přesune pouze danou položku
5. Překreslí UI

### Detekce kolizí
1. Pro každou naplánovanou položku
2. Porovná s ostatními na stejný den
3. Kontroluje překryv časů
4. Zvýrazní červeně

## Další kroky pro produkci

1. **Backend integrace**
   - Připojení k Helios REST API
   - Real-time synchronizace
   - Error handling

2. **Rozšířené funkce**
   - Hromadné operace
   - Historie změn (undo/redo)
   - Export do PDF
   - Tisk týdenního plánu

3. **Performance**
   - Virtualizace pro 100+ položek
   - Lazy loading
   - Caching

4. **Bezpečnost**
   - Autentizace
   - Role-based access
   - Audit log

5. **Testování**
   - Unit testy
   - Integration testy
   - UAT s uživateli

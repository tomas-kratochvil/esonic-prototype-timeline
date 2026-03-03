# Prototyp plánovací aplikace - Aktualizace

## Struktura souborů

```
prototype/
├── index.html              # Hlavní plánovací rozhraní (drag & drop)
├── production_view.html    # Read-only pohled pro výrobu
├── config.html            # Konfigurační rozhraní
├── app.js                 # Logika plánovací aplikace
├── production_view.js     # Logika výrobního pohledu
├── config.js              # Logika konfigurace
├── styles.css             # Společné styly
└── README.md              # Dokumentace
```

## Nové funkce

### 🏭 Výrobní pohled (production_view.html)

**Účel:** Read-only zobrazení denních úkolů pro výrobní dělníky

**Funkce:**
- ✅ Výběr dne (7 dní)
- ✅ Timeline se všemi úkoly na daný den
- ✅ Barevné rozlišení typů úkolů
- ✅ Statusy úkolů (čeká, probíhá, dokončeno)
- ✅ Zvýraznění aktuálně probíhajících úkolů
- ✅ Aktuální čas a datum (real-time)
- ✅ Auto-refresh každých 30 sekund
- ✅ Tlačítko pro celou obrazovku (vhodné pro nástěnný displej)
- 🚫 **Žádná možnost editace**

**Použití:**
- Zobrazení na displeji ve výrobě
- Přehled pro mistra/vedoucího směny
- Navigace mezi dny pro plánování vlastní práce

### ⚙️ Konfigurační rozhraní (config.html)

**Účel:** Správa typů výrobních příkazů a šablon receptů

**Funkce:**

#### 📋 Typy příkazů
- Přidání/úprava/smazání typů výrobních příkazů
- Nastavení:
  - ID typu (např. "podklad")
  - Zobrazovaný název (např. "Výroba podkladu")
  - Barva (color picker)
  - Defaultní trvání v hodinách
- Defaultně přednastavené typy:
  - Podklad (modrá, 2h)
  - Tvaroh (fialová, 2h)
  - Krém (růžová, 1h)
  - Freezer (zelená, 1h)

#### 🎯 Šablony receptů
- Vytváření šablon pro různé typy výrobků
- Definice sekvence příkazů s časovými rozestupy
- Ukázkové šablony:
  - Standardní dort (4 příkazy, -3 dny)
  - Velký dort 2kg+ (4 příkazy, -4 dny, delší časy)
- Zobrazení příkazů v každé šabloně s barvami

#### 🔧 Obecné nastavení
- Pracovní doba (začátek/konec)
- URL Helios API
- Interval auto-refresh

**Datové uložení:**
- localStorage (pro prototyp)
- V produkci: synchronizace s Helios/DB

## Spuštění prototypu

### 1. Plánovací rozhraní
```
index.html
```
Hlavní aplikace pro plánovače s drag & drop funkcionalitou.

### 2. Výrobní pohled
```
production_view.html
```
Read-only zobrazení pro výrobní dělníky.

### 3. Konfigurace
```
config.html
```
Administrace typů příkazů a šablon.

## Navigace mezi stránkami

```
┌─────────────────┐
│  index.html     │ ←┐
│  (Plánování)    │  │
└────┬────────────┘  │
     │                │
     ├─→ production_view.html
     │   (Výroba)
     │
     └─→ config.html ─┘
         (Konfigurace)
```

- Z hlavní aplikace lze otevřít výrobní pohled nebo konfiguraci
- Z konfigurace se lze vrátit na plánování
- Výrobní pohled je standalone (typicky na samostatném displeji)

## Integrace dat

### LocalStorage struktura

```javascript
// Typy příkazů
localStorage['config_command_types'] = [
  {
    id: 'podklad',
    name: 'Výroba podkladu',
    color: '#3b82f6',
    defaultDuration: 2
  },
  // ...
]

// Šablony receptů
localStorage['config_recipe_templates'] = [
  {
    id: 'standard_cake',
    name: 'Standardní dort',
    commands: [
      { typeId: 'podklad', offsetDays: -3, duration: 2 },
      // ...
    ]
  }
]

// Obecné nastavení
localStorage['config_general'] = {
  workStartHour: 6,
  workEndHour: 22,
  heliosApiUrl: 'https://...',
  refreshInterval: 30
}

// Naplánované úkoly (sdíleno mezi aplikacemi)
localStorage['planning_data'] = {
  plannedItems: [...],
  recipes: [...]
}
```

## Workflow použití

### Administrátor:
1. Otevře **config.html**
2. Nadefinuje typy výrobních příkazů (barvy, časy)
3. Vytvoří šablony receptů pro různé produkty
4. Nastaví pracovní dobu a API URL

### Plánovač:
1. Otevře **index.html**
2. Načte objednávky z Helios
3. Použije drag & drop pro plánování
4. Kontroluje kolize
5. Uloží změny zpět do Helios

### Výrobní dělník:
1. Displej zobrazuje **production_view.html**
2. Vidí úkoly na aktuální den
3. Sleduje status (čeká/probíhá/hotovo)
4. Stránka se automaticky obnovuje

## Další vylepšení (pro produkci)

### Výrobní pohled:
- [ ] Zadávání statusů úkolů (tlačítko "Zahájit", "Dokončit")
- [ ] Push notifikace při změně plánu
- [ ] QR kód pro rychlý přístup
- [ ] Hlasové oznámení nového úkolu

### Konfigurace:
- [ ] Import/export konfigurace (JSON)
- [ ] Validace konfliktů v šablonách
- [ ] Vizuální editor šablon (drag & drop)
- [ ] Historie změn konfigurace

### Integrace:
- [ ] Real-time synchronizace přes WebSocket
- [ ] Multi-user support (zamykání při editaci)
- [ ] Offline mód s queue operací
- [ ] Audit log všech změn

## Klíčové algoritmy

### Auto-refresh ve výrobním pohledu
```javascript
setInterval(() => {
    loadData();           // Načte data z API/localStorage
    renderTimeline();     // Překreslí timeline
    updateLastRefreshTime(); // Aktualizuje čas poslední aktualizace
}, 30000); // 30 sekund
```

### Detekce aktuálně probíhajícího úkolu
```javascript
const currentHour = new Date().getHours();
const isToday = isSameDay(task.date, new Date());

if (isToday && 
    currentHour >= task.startHour && 
    currentHour < task.startHour + task.duration) {
    // Úkol právě probíhá
    element.classList.add('current');
}
```

## Testovací scénáře

### Test 1: Konfigurace nového typu příkazu
1. Otevřít config.html
2. Kliknout "➕ Přidat nový typ"
3. Vyplnit: ID="cukrova_poleva", Název="Cukrová poleva", Barva=oranžová, Trvání=1h
4. Kliknout "Přidat"
5. ✓ Nový typ se zobrazí v seznamu

### Test 2: Výrobní pohled - přepínání dnů
1. Otevřít production_view.html
2. Kliknout na zítřejší den
3. ✓ Timeline se aktualizuje na úkoly zítřka
4. ✓ Počet úkolů se změní

### Test 3: Auto-refresh výrobního pohledu
1. Otevřít production_view.html
2. V jiné kartě otevřít index.html
3. Naplánovat nový úkol na dnes
4. Počkat 30 sekund
5. ✓ Nový úkol se objeví ve výrobním pohledu

## Technické detaily

**Browser support:**
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

**Použité API:**
- localStorage API
- Date API
- Fullscreen API
- Color input (HTML5)

**Responzivita:**
- Desktop optimalizováno
- Tablety podporováno
- Mobily částečně (production view vhodný pro tablet 10"+)

---

**Poznámka:** Toto je prototyp pro demonstraci. Pro produkční nasazení je potřeba:
- Backend API integrace
- Autentizace a autorizace
- Error handling
- Performance optimalizace
- Cross-browser testing

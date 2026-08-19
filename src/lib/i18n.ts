import { CrosshairShape, Language } from "./types";

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  
  // Themes & UI
  themeMaterial: string;
  themeGlass: string;
  accentPalette: string;
  customAccent: string;
  languageSelect: string;

  // Tabs
  tabShape: string;
  tabSize: string;
  tabColor: string;
  tabImage: string;
  tabHotkeys: string;
  tabProfiles: string;
  tabGameBar: string;

  // Game Bar Panel
  gameBarCardTitle: string;
  gameBarStatusLabel: string;
  gameBarInstalled: string;
  gameBarNotInstalled: string;
  gameBarInstallBtn: string;
  gameBarInstallSuccess: string;
  gameBarSyncBtn: string;
  gameBarSyncSuccess: string;
  gameBarUninstallBtn: string;
  gameBarUninstallSuccess: string;
  gameBarOpenBtn: string;
  gameBarInstructionsTitle: string;
  gameBarStep1: string;
  gameBarStep2: string;
  gameBarStep3: string;
  gameBarStep4: string;
  gameBarHintFullscreen: string;

  // Shapes
  shapeCross: string;
  shapeDot: string;
  shapeCircle: string;
  shapeChevron: string;
  shapeT: string;
  shapeSquare: string;

  // Shape Panel
  shapeCardTitle: string;
  rotationCardTitle: string;
  angleLabel: string;
  centerDotCardTitle: string;
  enableCenterDot: string;
  dotSizeLabel: string;
  dotShapeLabel: string;
  dotShapeCircle: string;
  dotShapeSquare: string;

  // Size Panel
  geometryCardTitle: string;
  thicknessLabel: string;
  gapLabel: string;
  lengthLabel: string;
  sizeLabel: string;
  sizeHint: string;
  roundnessLabel: string;
  screenPosCardTitle: string;
  offsetXLabel: string;
  offsetYLabel: string;
  monitorLabel: string;
  monitorPrimary: string;
  positionHint: string;
  borderlessWarning: string;

  // Color Panel
  linesCardTitle: string;
  lineColorLabel: string;
  opacityLabel: string;
  outlineCardTitle: string;
  enableOutline: string;
  outlineThicknessLabel: string;
  outlineColorLabel: string;
  outlineOpacityLabel: string;
  centerDotColorCardTitle: string;
  dotColorLabel: string;
  dotDisabledHint: string;

  // Image Panel
  imageCardTitle: string;
  enableImage: string;
  fileLabel: string;
  chooseFileBtn: string;
  noFileSelected: string;
  imageFormatHint: string;
  imageAdjustCardTitle: string;
  imageScaleLabel: string;
  imageRotationLabel: string;
  imageOpacityLabel: string;
  imageShiftXLabel: string;
  imageShiftYLabel: string;

  // Hotkeys Panel
  hotkeysCardTitle: string;
  toggleOverlayLabel: string;
  toggleSettingsLabel: string;
  hotkeyHintsTitle: string;
  hotkeyHint1: string;
  hotkeyHint2: string;
  hotkeyPressPrompt: string;
  hotkeyClearPrompt: string;

  // Profiles Panel
  profilesCardTitle: string;
  saveCurrentBtn: string;
  newProfileBtn: string;
  importBtn: string;
  exportBtn: string;
  profileNamePlaceholder: string;
  noProfilesYet: string;
  deleteConfirmTitle: string;
  deleteBtn: string;
  cancelBtn: string;
  saveBtn: string;
  overwriteTooltip: string;
  renameTooltip: string;
  exportTooltip: string;
  deleteTooltip: string;
  quickPresetsCardTitle: string;
  quickPresetsHint: string;
  defaultProfileName: string;

  // Presets
  presetClassic: string;
  presetDot: string;
  presetCircle: string;
  presetChevron: string;
  presetT: string;
  presetSquare: string;
  presetTactical: string;
  presetLargeDot: string;

  // Preview
  bgGrid: string;
  bgDark: string;
  bgLight: string;
  bgScreenshot: string;
  screenshotTooltip: string;

  // Color picker
  colorHex: string;
  colorPresets: string;
  clickToChange: string;
  clickToEdit: string;

  // Autostart
  autostartLabel: string;
  autostartBtn: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  ru: {
    appName: "CrosshairZ",
    appSubtitle: "Нативный оверлей-прицел для игр",

    themeMaterial: "Material 3",
    themeGlass: "Liquid Glass",
    accentPalette: "Акцентный цвет",
    customAccent: "Свой цвет…",
    languageSelect: "Язык интерфейса",

    tabShape: "Форма",
    tabSize: "Размеры",
    tabColor: "Цвет",
    tabImage: "Изображение",
    tabHotkeys: "Клавиши",
    tabProfiles: "Профили",

    shapeCross: "Перекрестие",
    shapeDot: "Точка",
    shapeCircle: "Круг",
    shapeChevron: "Шеврон",
    shapeT: "Т-прицел",
    shapeSquare: "Квадрат",

    shapeCardTitle: "Форма прицела",
    rotationCardTitle: "Вращение",
    angleLabel: "Угол поворота",
    centerDotCardTitle: "Центральная точка",
    enableCenterDot: "Включить точку",
    dotSizeLabel: "Размер точки",
    dotShapeLabel: "Форма точки",
    dotShapeCircle: "Круг",
    dotShapeSquare: "Квадрат",

    geometryCardTitle: "Геометрия линий",
    thicknessLabel: "Толщина",
    gapLabel: "Зазор",
    lengthLabel: "Длина лучей",
    sizeLabel: "Размер",
    sizeHint: "«Размер» применяется к точке, кругу и квадрату",
    roundnessLabel: "Скругление",
    screenPosCardTitle: "Позиция на экране",
    offsetXLabel: "Смещение X",
    offsetYLabel: "Смещение Y",
    monitorLabel: "Монитор",
    monitorPrimary: "Основной монитор",
    positionHint: "Смещение указывается в физических пикселях от центра экрана.",
    borderlessWarning: "Оверлей работает поверх оконных и borderless-игр. В эксклюзивном полноэкранном режиме DirectX переключите игру на «окно без рамки».",

    linesCardTitle: "Линии прицела",
    lineColorLabel: "Цвет линий",
    opacityLabel: "Прозрачность",
    outlineCardTitle: "Обводка и тень",
    enableOutline: "Включить обводку",
    outlineThicknessLabel: "Толщина обводки",
    outlineColorLabel: "Цвет обводки",
    outlineOpacityLabel: "Прозрачность обводки",
    centerDotColorCardTitle: "Цвет точки",
    dotColorLabel: "Цвет точки",
    dotDisabledHint: "Точка отключена — включите её на вкладке «Форма».",

    imageCardTitle: "Своё изображение",
    enableImage: "Использовать изображение",
    fileLabel: "Файл",
    chooseFileBtn: "Выбрать файл…",
    noFileSelected: "Файл не выбран",
    imageFormatHint: "Поддерживаются PNG, SVG и анимированные GIF. Файл копируется в базу приложения.",
    imageAdjustCardTitle: "Настройка изображения",
    imageScaleLabel: "Масштаб",
    imageRotationLabel: "Поворот",
    imageOpacityLabel: "Прозрачность",
    imageShiftXLabel: "Сдвиг X",
    imageShiftYLabel: "Сдвиг Y",

    hotkeysCardTitle: "Глобальные горячие клавиши",
    toggleOverlayLabel: "Показать/скрыть прицел",
    toggleSettingsLabel: "Окно настроек",
    hotkeyHintsTitle: "Информация о хоткеях",
    hotkeyHint1: "Нажмите на поле, затем нужную комбинацию. Backspace очищает привязку, Esc отменяет запись.",
    hotkeyHint2: "Хоткеи действуют глобально во всех играх. Выбирайте свободные комбинации клавиш.",
    hotkeyPressPrompt: "Нажмите клавиши...",
    hotkeyClearPrompt: "Не назначено",

    profilesCardTitle: "Управление профилями",
    saveCurrentBtn: "Сохранить текущий",
    newProfileBtn: "Новый профиль",
    importBtn: "Импорт…",
    exportBtn: "Экспорт…",
    profileNamePlaceholder: "Введите имя профиля",
    noProfilesYet: "Профилей пока нет — создайте первый или выберите быстрый пресет.",
    deleteConfirmTitle: "Удалить профиль?",
    deleteBtn: "Удалить",
    cancelBtn: "Отмена",
    saveBtn: "Сохранить",
    overwriteTooltip: "Перезаписать профиль текущими настройками",
    renameTooltip: "Переименовать профиль",
    exportTooltip: "Экспортировать в файл JSON",
    deleteTooltip: "Удалить профиль",
    quickPresetsCardTitle: "Быстрые пресеты",
    quickPresetsHint: "Пресет применяется к холсту. Сохраните его в профиль, чтобы закрепить.",
    defaultProfileName: "Мой прицел",

    presetClassic: "Классика",
    presetDot: "Точка",
    presetCircle: "Круг",
    presetChevron: "Шеврон",
    presetT: "Т-прицел",
    presetSquare: "Квадрат",
    presetTactical: "Тактический",
    presetLargeDot: "Крупный + точка",

    bgGrid: "Сетка",
    bgDark: "Тёмный",
    bgLight: "Светлый",
    bgScreenshot: "Скриншот…",
    screenshotTooltip: "Загрузить скриншот игры для проверки контрастности прицела",

    colorHex: "HEX",
    colorPresets: "Палитра",
    clickToChange: "Изменить цвет",
    clickToEdit: "Нажмите, чтобы ввести значение",

    autostartLabel: "Запускать вместе с Windows",
    autostartBtn: "Автозапуск",

    tabGameBar: "Game Bar",
    gameBarCardTitle: "Xbox Game Bar Оверлей",
    gameBarStatusLabel: "Статус виджета:",
    gameBarInstalled: "Установлен и готов к работе",
    gameBarNotInstalled: "Не установлен в системе",
    gameBarInstallBtn: "Установить виджет в 1 клик",
    gameBarInstallSuccess: "Виджет успешно установлен и зарегистрирован в Game Bar!",
    gameBarSyncBtn: "Принудительно обновить виджет",
    gameBarSyncSuccess: "Настройки и форма прицела мгновенно синхронизированы с Game Bar!",
    gameBarUninstallBtn: "Удалить виджет",
    gameBarUninstallSuccess: "Виджет успешно удален из системы.",
    gameBarOpenBtn: "Открыть Game Bar (Win + G)",
    gameBarInstructionsTitle: "Как использовать в полноэкранных играх:",
    gameBarStep1: "Нажмите Win + G, чтобы открыть оверлей Game Bar.",
    gameBarStep2: "В «Меню виджетов» выберите CrosshairZ (нажмите ★, чтобы закрепить на панели).",
    gameBarStep3: "В открывшемся окне нажмите значок булавки 📌 в верхнем правом углу.",
    gameBarStep4: "Прицел зафиксируется поверх эксклюзивных полноэкранных игр со сквозным кликом!",
    gameBarHintFullscreen: "Виджет Xbox Game Bar работает во всех режимах экрана, включая эксклюзивный полноэкранный режим (DirectX 11/12, Vulkan) и синхронизируется с приложением моментально.",
  },
  en: {
    appName: "CrosshairZ",
    appSubtitle: "Native Crosshair Overlay for Games",

    themeMaterial: "Material 3",
    themeGlass: "Liquid Glass",
    accentPalette: "Accent Color",
    customAccent: "Custom Color…",
    languageSelect: "Language",

    tabShape: "Shape",
    tabSize: "Dimensions",
    tabColor: "Color",
    tabImage: "Image",
    tabHotkeys: "Hotkeys",
    tabProfiles: "Profiles",
    tabGameBar: "Game Bar",

    gameBarCardTitle: "Xbox Game Bar Overlay",
    gameBarStatusLabel: "Widget status:",
    gameBarInstalled: "Installed & Ready",
    gameBarNotInstalled: "Not installed in system",
    gameBarInstallBtn: "Install Widget in 1-Click",
    gameBarInstallSuccess: "Widget installed and registered in Game Bar successfully!",
    gameBarSyncBtn: "Force Sync Widget Now",
    gameBarSyncSuccess: "Crosshair settings & shape instantly synced with Game Bar!",
    gameBarUninstallBtn: "Uninstall Widget",
    gameBarUninstallSuccess: "Widget removed from the system successfully.",
    gameBarOpenBtn: "Open Game Bar (Win + G)",
    gameBarInstructionsTitle: "How to use in exclusive fullscreen games:",
    gameBarStep1: "Press Win + G to open the Xbox Game Bar overlay.",
    gameBarStep2: "In the Widget Menu, select CrosshairZ (click ★ to pin to top bar).",
    gameBarStep3: "Click the Pin 📌 icon in the top right corner of the widget.",
    gameBarStep4: "The crosshair will stay fixed over exclusive fullscreen games with click-through!",
    gameBarHintFullscreen: "The Xbox Game Bar widget works in all screen modes including Exclusive Fullscreen (DirectX 11/12, Vulkan) and syncs instantly with your app settings.",

    shapeCross: "Crosshair",
    shapeDot: "Dot",
    shapeCircle: "Circle",
    shapeChevron: "Chevron",
    shapeT: "T-Shape",
    shapeSquare: "Square",

    shapeCardTitle: "Crosshair Shape",
    rotationCardTitle: "Rotation",
    angleLabel: "Angle",
    centerDotCardTitle: "Center Dot",
    enableCenterDot: "Enable Center Dot",
    dotSizeLabel: "Dot Size",
    dotShapeLabel: "Dot Shape",
    dotShapeCircle: "Circle",
    dotShapeSquare: "Square",

    geometryCardTitle: "Line Geometry",
    thicknessLabel: "Thickness",
    gapLabel: "Gap",
    lengthLabel: "Arm Length",
    sizeLabel: "Size",
    sizeHint: "“Size” applies to Dot, Circle and Square shapes",
    roundnessLabel: "Corner Radius",
    screenPosCardTitle: "Screen Position",
    offsetXLabel: "Offset X",
    offsetYLabel: "Offset Y",
    monitorLabel: "Display",
    monitorPrimary: "Primary Display",
    positionHint: "Offsets are defined in physical pixels from screen center.",
    borderlessWarning: "Overlay renders over Windowed and Borderless games. For Exclusive Fullscreen, switch the game display mode to Borderless.",

    linesCardTitle: "Crosshair Lines",
    lineColorLabel: "Line Color",
    opacityLabel: "Opacity",
    outlineCardTitle: "Outline & Shadow",
    enableOutline: "Enable Outline",
    outlineThicknessLabel: "Outline Thickness",
    outlineColorLabel: "Outline Color",
    outlineOpacityLabel: "Outline Opacity",
    centerDotColorCardTitle: "Dot Color",
    dotColorLabel: "Center Dot Color",
    dotDisabledHint: "Center dot is disabled — enable it in the “Shape” tab.",

    imageCardTitle: "Custom Image Overlay",
    enableImage: "Use Custom Image",
    fileLabel: "Source File",
    chooseFileBtn: "Choose File…",
    noFileSelected: "No file selected",
    imageFormatHint: "Supports PNG, SVG, and animated GIFs. Copied into local app storage.",
    imageAdjustCardTitle: "Image Adjustments",
    imageScaleLabel: "Scale",
    imageRotationLabel: "Rotation",
    imageOpacityLabel: "Opacity",
    imageShiftXLabel: "Shift X",
    imageShiftYLabel: "Shift Y",

    hotkeysCardTitle: "Global Hotkeys",
    toggleOverlayLabel: "Toggle Crosshair Overlay",
    toggleSettingsLabel: "Toggle Settings Window",
    hotkeyHintsTitle: "Hotkey Information",
    hotkeyHint1: "Click the input box and press your key combo. Backspace clears, Escape cancels.",
    hotkeyHint2: "Hotkeys work globally across all games. Choose combos not used in your gameplay.",
    hotkeyPressPrompt: "Press keys...",
    hotkeyClearPrompt: "Unassigned",

    profilesCardTitle: "Profile Management",
    saveCurrentBtn: "Save Current",
    newProfileBtn: "New Profile",
    importBtn: "Import…",
    exportBtn: "Export…",
    profileNamePlaceholder: "Enter profile name",
    noProfilesYet: "No saved profiles yet — create one or pick a preset below.",
    deleteConfirmTitle: "Delete Profile?",
    deleteBtn: "Delete",
    cancelBtn: "Cancel",
    saveBtn: "Save",
    overwriteTooltip: "Overwrite this profile with current settings",
    renameTooltip: "Rename profile",
    exportTooltip: "Export to JSON file",
    deleteTooltip: "Delete profile",
    quickPresetsCardTitle: "Quick Presets",
    quickPresetsHint: "Preset applies immediately. Save it as a profile to preserve your edits.",
    defaultProfileName: "My Crosshair",

    presetClassic: "Classic",
    presetDot: "Dot",
    presetCircle: "Circle",
    presetChevron: "Chevron",
    presetT: "T-Cross",
    presetSquare: "Square",
    presetTactical: "Tactical",
    presetLargeDot: "Large + Dot",

    bgGrid: "Grid",
    bgDark: "Dark",
    bgLight: "Light",
    bgScreenshot: "Screenshot…",
    screenshotTooltip: "Upload a game screenshot to test crosshair visibility and contrast",

    colorHex: "HEX",
    colorPresets: "Presets",
    clickToChange: "Change Color",
    clickToEdit: "Click to edit value",

    autostartLabel: "Run on Windows startup",
    autostartBtn: "Autostart",
  },
};

export function getTranslation(lang: Language): TranslationDictionary {
  return TRANSLATIONS[lang] ?? TRANSLATIONS.ru;
}

export function getShapeLabel(shape: CrosshairShape, lang: Language): string {
  const t = getTranslation(lang);
  switch (shape) {
    case "cross": return t.shapeCross;
    case "dot": return t.shapeDot;
    case "circle": return t.shapeCircle;
    case "chevron": return t.shapeChevron;
    case "t": return t.shapeT;
    case "square": return t.shapeSquare;
  }
}

const NAV_COLORS = {
  light: { frontColor: '#000000', backgroundColor: '#eef3f8' },
  dark: { frontColor: '#ffffff', backgroundColor: '#0f1a24' }
};

function currentTheme() {
  try {
    const info = wx.getSystemInfoSync();
    return info && info.theme === 'dark' ? 'dark' : 'light';
  } catch (e) {
    return 'light';
  }
}

function applyNavTheme(theme) {
  const conf = NAV_COLORS[theme] || NAV_COLORS.light;
  wx.setNavigationBarColor({
    frontColor: conf.frontColor,
    backgroundColor: conf.backgroundColor,
    fail() {}
  });
}

App({
  onLaunch() {
    applyNavTheme(currentTheme());
    if (wx.onThemeChange) {
      wx.onThemeChange(({ theme }) => applyNavTheme(theme));
    }
  },

  onShow() {
    applyNavTheme(currentTheme());
  },

  applyNavTheme() {
    applyNavTheme(currentTheme());
  }
});

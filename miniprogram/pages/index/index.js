const cfg = require('../../data/config.js');
const priceLib = require('../../utils/price.js');
const share = require('../../utils/share.js');
const { PRICES_BY_VALUE } = require('../../data/prices.js');

const IMG = cfg.BACKKEY_IMAGES;
const KEYCAP_IMG = cfg.KEYCAP_IMAGES;
const FN_IMG = cfg.SPECIAL_BACKKEYS.filter(x => x.name === 'FN摇杆微动背键')[0].img;

function yuan(n) {
  return (n === undefined || n === null ? 0 : n) + ' 元';
}

function initialState() {
  return {
    motherboard: '',
    shell: '',
    shellColor: '',
    bo5Style: '',
    otherShell: '',
    midframe: '',
    upgrades: [],
    accessories: [],
    stick: 'DS13MAX摇杆',
    damping: '原装阻尼',
    dpad: { type: '', force: '', config: '', color: '' },
    interact: { type: '', force: '', config: '', color: '' },
    shoulder: { type: '', force: '', config: '' },
    trigger: { type: '', config: '' },
    backkey: {
      count: '',
      keycaps: [],
      positions: [],
      extraShoulder: '',
      fn: false,
      mic: false,
      hen: false
    },
    ergaiRequirement: '',
    typecChecked: false,
    typecDisabled: false
  };
}

Page({
  data: {
    step: 0,
    steps: [],
    progressText: '',
    isErGai: false,
    canSkip: false,
    readOnly: false,
    isFirst: true,
    isLast: false,
    showPanel: false,
    previewSrc: '',
    gallery: cfg.GALLERY,
    mbOptions: [],
    mbImage: '',
    midframeOptions: [],
    shells: [],
    shellImage: '',
    accessories: [],
    upgrades: [],
    stickOptions: [],
    dampingOptions: [],
    stickNotice: '',
    stickDesc: '',
    dpad: {},
    interact: {},
    shoulder: {},
    trigger: {},
    backkey: {},
    summary: { items: [], total: 0, count: 0, missing: [] },
    missingCount: 0,
    ergaiRequirement: ''
  },

  onLoad(options) {
    if (options && options.d) {
      // 数值部分为 base36，无特殊字符；二改要求由 share.decodeState 自行解码
      this.state = share.decodeState(options.d);
      this.readOnly = true;
    } else {
      this.state = initialState();
      this.readOnly = false;
    }
    this.refresh();
  },

  onShow() {
    const app = getApp();
    if (app && app.applyNavTheme) app.applyNavTheme();
  },

  onShareAppMessage() {
    const result = priceLib.compute(this.state);
    return {
      title: '我的改装配置 · ¥' + result.total,
      path: '/pages/index/index?d=' + share.encodeState(this.state),
      imageUrl: '/images/1.jpg'
    };
  },

  onUseAsTemplate() {
    this.readOnly = false;
    this.data.step = 0;
    this.refresh();
  },

  /* ================= 渲染数据 ================= */
  refresh() {
    const s = this.state;
    const result = priceLib.compute(s);
    const visibleSteps = this.visibleSteps();
    if (visibleSteps.indexOf(this.data.step) === -1) {
      this.data.step = visibleSteps[0];
    }
    const step = this.data.step;
    const pos = visibleSteps.indexOf(step);
    const hasDse = s.backkey.keycaps.indexOf('DSE金属豆子键帽') !== -1 ||
      s.backkey.keycaps.indexOf('DSE金属拨片键帽') !== -1;
    const lockedInteractColor = s.interact.type && s.interact.type !== '原装软胶垫' &&
      (s.dpad.color === '黑色' || s.dpad.color === '白色');

    this.setData({
      step,
      readOnly: !!this.readOnly,
      isFirst: pos === 0,
      isLast: pos === visibleSteps.length - 1,
      steps: visibleSteps.map(i => ({ index: i, title: cfg.STEP_TITLES[i], active: i === step })),
      progressText: '第 ' + (pos + 1) + '/' + visibleSteps.length + ' 步：' + cfg.STEP_TITLES[step],
      isErGai: priceLib.isErGai(s),
      canSkip: priceLib.isErGai(s) && step !== visibleSteps[0],

      mbOptions: cfg.MOTHERBOARDS.map(m => ({
        name: m.name,
        desc: m.desc || '',
        img: m.img || '',
        checked: s.motherboard === m.name,
        priceText: yuan(priceLib.base(m.name))
      })),
      mbImage: (cfg.MOTHERBOARDS.filter(m => m.name === s.motherboard)[0] || {}).img || '',

      midframeOptions: cfg.MIDFRAME.map(name => ({
        name,
        checked: s.midframe === name,
        priceText: yuan(priceLib.base(name))
      })),

      shells: this.buildShells(),
      shellImage: this.shellImage(),

      accessories: this.buildAccessories(),

      upgrades: priceLib.visibleUpgrades(s).map(u => ({
        name: u.name,
        checked: s.upgrades.indexOf(u.name) !== -1,
        priceText: yuan(priceLib.base(u.name))
      })),

      stickOptions: cfg.STICKS.map(st => ({
        name: st.name,
        desc: st.desc || '',
        checked: s.stick === st.name,
        priceText: yuan(priceLib.effectivePrice(st.name, s))
      })),
      dampingOptions: cfg.DAMPINGS.map(d => ({
        name: d.name,
        label: d.label,
        checked: s.damping === d.name,
        disabled: cfg.TMR_STICKS.indexOf(s.stick) !== -1,
        priceText: yuan(priceLib.base(d.name))
      })),
      stickNotice: cfg.TMR_STICKS.indexOf(s.stick) !== -1 ? 'TMR摇杆暂不支持减阻尼改装' : '',
      stickDesc: (cfg.STICKS.filter(st => st.name === s.stick)[0] || {}).desc || '',

      dpad: this.buildModuleVm('dpad', s.dpad, s, cfg.DPAD_IMAGES, lockedInteractColor, false),
      interact: this.buildModuleVm('interact', s.interact, s, cfg.INTERACT_IMAGES, lockedInteractColor, true),

      shoulder: this.buildShoulder(s),
      trigger: this.buildTrigger(s),

      backkey: this.buildBackkey(s, hasDse),

      summary: {
        items: result.items,
        total: result.total,
        count: result.items.length,
        missing: result.missing
      },
      missingCount: result.missing.length,
      ergaiRequirement: s.ergaiRequirement
    });
  },

  visibleSteps() {
    const list = [];
    for (let i = 0; i < cfg.STEP_TITLES.length; i++) {
      if (i === 3 && !priceLib.upgradeStepVisible(this.state)) continue;
      list.push(i);
    }
    return list;
  },

  buildShells() {
    const s = this.state;
    return cfg.SHELLS.map(sh => {
      const selected = s.shell === sh.name;
      let priceText = yuan(priceLib.base(sh.name));
      if (sh.name === 'BO5国产外壳') {
        priceText = s.bo5Style
          ? yuan(PRICES_BY_VALUE['bo5-style'][s.bo5Style])
          : '按款式';
      } else if (sh.name === '其他外壳') {
        priceText = s.otherShell
          ? yuan(PRICES_BY_VALUE['other-shell'][s.otherShell])
          : '按选项';
      }
      return {
        name: sh.name,
        desc: selected && sh.name === '其他外壳' && s.otherShell
          ? ((sh.otherDescs || {})[s.otherShell] || '')
          : (sh.desc || ''),
        selected,
        priceText,
        colors: (sh.colors || []).map(c => ({
          value: c,
          checked: selected && s.shellColor === c,
          disabled: !selected
        })),
        styles: (sh.styles || []).map(c => ({
          value: c,
          checked: selected && s.bo5Style === c,
          disabled: !selected,
          priceText: yuan(PRICES_BY_VALUE['bo5-style'][c])
        })),
        backShells: (sh.backShells || []).map(c => ({
          value: c,
          checked: selected && s.bo5Style === c,
          disabled: !selected,
          priceText: yuan(PRICES_BY_VALUE['bo5-style'][c])
        })),
        otherOptions: (sh.otherOptions || []).map(c => ({
          value: c,
          checked: selected && s.otherShell === c,
          disabled: !selected,
          priceText: yuan(PRICES_BY_VALUE['other-shell'][c])
        }))
      };
    });
  },

  shellImage() {
    const s = this.state;
    if (s.shell === '其他外壳') {
      return s.otherShell === '喷漆外壳' ? cfg.SHELL_EXTRA_IMAGES.oupian : '';
    }
    const sh = cfg.SHELLS.filter(x => x.name === s.shell)[0];
    return sh && sh.img ? sh.img : '';
  },

  buildAccessories() {
    const s = this.state;
    return cfg.ACCESSORIES.filter(a => !a.onlyErGai || priceLib.isErGai(s)).map(a => {
      const checked = s.accessories.indexOf(a.name) !== -1;
      let disabled = false;
      let note = a.note || '';
      if (a.name === 'TYPEC接口制作') {
        disabled = s.typecDisabled;
        if (priceLib.isErGai(s)) {
          note = '如果寄改手柄没有制作TYPEC接口，那么请根据需要选择本项目';
        } else if (s.shell === '振飞扬国产外壳') {
          note = '振飞扬外壳自带TYPEC接口，无需额外制作';
        } else if (s.shell) {
          note = '该外壳需制作TYPEC接口，默认勾选且不可取消';
        }
      }
      if (a.name === '菜单背包微动' && priceLib.isGns(s)) {
        disabled = true;
        note = '';
      }
      return {
        name: a.name,
        img: a.img || '',
        checked,
        disabled,
        note,
        showNote: !!note,
        priceText: yuan(priceLib.effectivePrice(a.name, s))
      };
    });
  },

  buildModuleVm(key, mod, s, imgMap, lockedInteractColor, isInteract) {
    const showForce = mod.type === '凯隆小微动';
    const showConfig = mod.type === '热插拔大微动';
    const colorNames = mod.type ? cfg.COLORS.slice() : [];
    if (mod.type === '原装软胶垫') colorNames.push('原装按键');
    const colorLocked = isInteract && lockedInteractColor;

    return {
      types: cfg.MODULE_TYPES.map(name => {
        let priceText = yuan(priceLib.base(name));
        return {
          name,
          checked: mod.type === name,
          priceText
        };
      }),
      showForce,
      forceOptions: cfg.FORCES.map(name => ({
        name,
        checked: mod.force === name,
        priceText: yuan(priceLib.base(name))
      })),
      showConfig,
      configOptions: ['标配TTC金+青龙', '自备微动'].map(name => ({
        name,
        checked: mod.config === name,
        priceText: yuan(priceLib.base(name))
      })),
      colorOptions: colorNames.map(name => ({
        name,
        checked: mod.color === name,
        disabled: colorLocked && mod.color !== name,
        priceText: yuan(mod.type === '原装软胶垫' ? priceLib.colorPrice(s, mod.type) : 0)
      })),
      typeImg: imgMap[mod.type] || '',
      colorImg: cfg.COLOR_IMAGES[mod.color] || ''
    };
  },

  buildShoulder(s) {
    const sh = s.shoulder;
    return {
      types: cfg.SHOULDERS.map(t => ({
        name: t.name,
        label: t.label,
        checked: sh.type === t.name,
        priceText: yuan(priceLib.base(t.name))
      })),
      showForce: sh.type === '肩键改装 凯隆普通微动',
      forceOptions: cfg.FORCES.map(name => ({
        name,
        checked: sh.force === name,
        priceText: yuan(priceLib.base(name))
      })),
      showConfig: sh.type === '肩键改装 热插拔大微动',
      configOptions: ['青龙微动', '自备微动'].map(name => ({
        name,
        checked: sh.config === name,
        priceText: yuan(priceLib.base(name))
      })),
      img: (cfg.SHOULDERS.filter(t => t.name === sh.type)[0] || {}).img || ''
    };
  },

  buildTrigger(s) {
    const tr = s.trigger;
    const normalDisabled = s.shoulder.type === '肩键改装 凯隆弹片微动';
    const dualDisabled = cfg.DUAL_TRIGGER_BOARDS.indexOf(s.motherboard) === -1;
    return {
      types: cfg.TRIGGERS.map(t => ({
        name: t.name,
        label: t.label,
        checked: tr.type === t.name,
        disabled: t.name === '扳机键改装 凯隆普通微动' ? normalDisabled
          : (t.name === '扳机键改装 双切热插拔微动' ? dualDisabled : false),
        priceText: yuan(priceLib.base(t.name))
      })),
      normalNotice: normalDisabled ? '肩键使用弹片微动时不可选择普通微动扳机' : '',
      dualNotice: dualDisabled ? '所选主板无线性扳机，不支持双切微动' : '',
      showConfig: tr.type === '扳机键改装 热插拔大微动' || tr.type === '扳机键改装 双切热插拔微动',
      configOptions: ['TTC金微动', '自备微动'].map(name => ({
        name,
        checked: tr.config === name,
        priceText: yuan(priceLib.base(name))
      })),
      img: (cfg.TRIGGERS.filter(t => t.name === tr.type)[0] || {}).img || ''
    };
  },

  buildBackkey(s, hasDse) {
    const b = s.backkey;
    const kp = priceLib.keycapPrices(s);
    const keycapTotal = b.keycaps.reduce((sum, n) => sum + (kp[n] || 0), 0);
    const countPrice = b.count === '2' ? priceLib.base('2个背键') : (b.count === '4' ? priceLib.base('4个背键') : 0);
    const images = [];
    if (b.extraShoulder) images.push(IMG[b.extraShoulder]);
    if (hasDse && b.keycaps.indexOf('DSE金属豆子键帽') !== -1 && b.keycaps.indexOf('DSE金属拨片键帽') !== -1) {
      images.push(IMG['dse-both']);
    } else if (b.keycaps.indexOf('DSE金属豆子键帽') !== -1) {
      images.push(IMG['dse-bean']);
    } else if (b.keycaps.indexOf('DSE金属拨片键帽') !== -1) {
      images.push(IMG['dse-paddle']);
    }
    b.keycaps.forEach(n => { if (KEYCAP_IMG[n]) images.push(KEYCAP_IMG[n]); });
    if (b.positions.length) images.push(IMG.positions);
    if (b.fn) images.push(FN_IMG);

    return {
      extraShoulders: cfg.EXTRA_SHOULDERS.map(name => ({
        name,
        checked: b.extraShoulder === name,
        priceText: yuan(priceLib.base(name))
      })),
      counts: cfg.BACKKEY_COUNTS.map(c => ({
        value: c.value,
        name: c.name,
        checked: b.count === c.value,
        priceText: yuan(priceLib.base(c.name) + (b.count === c.value ? keycapTotal : 0))
      })),
      countPriceText: b.count ? yuan(countPrice + keycapTotal) : '0 元',
      showSub: !!b.count,
      keycaps: cfg.KEYCAPS.map(name => ({
        name,
        checked: b.keycaps.indexOf(name) !== -1,
        priceText: yuan(kp[name] || 0)
      })),
      positions: cfg.POSITIONS.map(name => ({
        name,
        checked: b.positions.indexOf(name) !== -1,
        disabled: name === '背键34号位置' ? !hasDse : false
      })),
      specials: cfg.SPECIAL_BACKKEYS
        .filter(sp => !sp.gnsOnly || priceLib.isGns(s))
        .map(sp => ({
          name: sp.name,
          checked: sp.name === 'FN摇杆微动背键' ? b.fn : b.mic,
          priceText: yuan(priceLib.base(sp.name))
        })),
      henChecked: b.hen,
      henPriceText: yuan(priceLib.base(cfg.HEN_CHIP)),
      images
    };
  },

  /* ================= 交互 ================= */
  onTapMotherboard(e) {
    const s = this.state;
    const name = e.currentTarget.dataset.name;
    s.motherboard = name;
    if (priceLib.isErGai(s)) {
      s.accessories = s.accessories.filter(n => n !== 'TYPEC接口制作');
    }
    this.refresh();
  },

  onTapMidframe(e) {
    this.state.midframe = e.currentTarget.dataset.name;
    this.refresh();
  },

  onTapShell(e) {
    const s = this.state;
    s.shell = e.currentTarget.dataset.name;
    s.shellColor = '';
    s.bo5Style = '';
    s.otherShell = '';
    this.refresh();
  },

  onTapShellColor(e) {
    const { value, shell } = e.currentTarget.dataset;
    if (this.state.shell !== shell) return;
    this.state.shellColor = value;
    this.refresh();
  },

  onTapBo5Style(e) {
    const { value, shell } = e.currentTarget.dataset;
    if (this.state.shell !== shell) return;
    this.state.bo5Style = value;
    this.refresh();
  },

  onTapOtherShell(e) {
    const { value, shell } = e.currentTarget.dataset;
    if (this.state.shell !== shell) return;
    this.state.otherShell = value;
    this.refresh();
  },

  onToggleAccessory(e) {
    const item = this.data.accessories[e.currentTarget.dataset.index];
    if (!item || item.disabled) return;
    const s = this.state;
    const i = s.accessories.indexOf(item.name);
    if (i === -1) s.accessories.push(item.name);
    else s.accessories.splice(i, 1);
    this.refresh();
  },

  onToggleUpgrade(e) {
    const item = this.data.upgrades[e.currentTarget.dataset.index];
    if (!item) return;
    const s = this.state;
    const i = s.upgrades.indexOf(item.name);
    if (i === -1) {
      s.upgrades.push(item.name);
      // 触摸板与显示屏互斥
      const other = item.name === '触摸板' ? '显示屏' : (item.name === '显示屏' ? '触摸板' : '');
      if (other) s.upgrades = s.upgrades.filter(n => n !== other);
      // ProShock：蓝牙/2.4G/陀螺仪三选一
      if (s.motherboard === 'ProShock主板' &&
        ['蓝牙模块', '2.4G无线模块', '体感陀螺仪'].indexOf(item.name) !== -1) {
        s.upgrades = s.upgrades.filter(n =>
          n === item.name || ['蓝牙模块', '2.4G无线模块', '体感陀螺仪'].indexOf(n) === -1);
      }
    } else {
      s.upgrades.splice(i, 1);
    }
    this.refresh();
  },

  onTapStick(e) {
    const s = this.state;
    const name = e.currentTarget.dataset.name;
    s.stick = name;
    // 与网站一致：切换摇杆时清空阻尼选择，由用户重新选择；TMR 摇杆强制原装阻尼
    s.damping = cfg.TMR_STICKS.indexOf(name) !== -1 ? '原装阻尼' : '';
    this.refresh();
  },

  onTapDamping(e) {
    const name = e.currentTarget.dataset.name;
    if (cfg.TMR_STICKS.indexOf(this.state.stick) !== -1) return;
    this.state.damping = name;
    this.refresh();
  },

  onTapModuleType(e) {
    const { key, name } = e.currentTarget.dataset;
    const s = this.state;
    const mod = s[key];
    mod.type = name;
    mod.force = '';
    mod.config = '';
    mod.color = '';
    if (name === '凯隆小微动') mod.force = '90g';
    if (name === '热插拔大微动') mod.config = '标配TTC金+青龙';
    if (name === '原装软胶垫') mod.color = '原装按键';
    // 交互键跟随十字键颜色
    if (key === 'interact' && name !== '原装软胶垫' &&
      (s.dpad.color === '黑色' || s.dpad.color === '白色')) {
      mod.color = s.dpad.color;
    }
    this.refresh();
  },

  onTapModuleForce(e) {
    const { key, name } = e.currentTarget.dataset;
    this.state[key].force = name;
    this.refresh();
  },

  onTapModuleConfig(e) {
    const { key, name } = e.currentTarget.dataset;
    this.state[key].config = name;
    this.refresh();
  },

  onTapModuleColor(e) {
    const { key, name } = e.currentTarget.dataset;
    const s = this.state;
    if (key === 'interact') {
      const locked = s.interact.type && s.interact.type !== '原装软胶垫' &&
        (s.dpad.color === '黑色' || s.dpad.color === '白色');
      if (locked && s.interact.color !== name) return;
    }
    s[key].color = name;
    // 十字键颜色同步到交互键
    if (key === 'dpad' && name !== '原装按键' && s.interact.type && s.interact.type !== '原装软胶垫') {
      s.interact.color = name;
    }
    this.refresh();
  },

  onTapShoulderType(e) {
    const s = this.state;
    const name = e.currentTarget.dataset.name;
    s.shoulder.type = name;
    s.shoulder.force = '';
    s.shoulder.config = '';
    if (name === '肩键改装 凯隆普通微动') s.shoulder.force = '120g';
    if (name === '肩键改装 热插拔大微动') s.shoulder.config = '青龙微动';
    this.refresh();
  },

  onTapShoulderForce(e) {
    this.state.shoulder.force = e.currentTarget.dataset.name;
    this.refresh();
  },

  onTapShoulderConfig(e) {
    this.state.shoulder.config = e.currentTarget.dataset.name;
    this.refresh();
  },

  onTapTriggerType(e) {
    const item = this.data.trigger.types[e.currentTarget.dataset.index];
    if (!item || item.disabled) return;
    const s = this.state;
    s.trigger.type = item.name;
    s.trigger.config = '';
    if (item.name === '扳机键改装 热插拔大微动' || item.name === '扳机键改装 双切热插拔微动') {
      s.trigger.config = 'TTC金微动';
    }
    this.refresh();
  },

  onTapTriggerConfig(e) {
    this.state.trigger.config = e.currentTarget.dataset.name;
    this.refresh();
  },

  onTapExtraShoulder(e) {
    const name = e.currentTarget.dataset.name;
    const b = this.state.backkey;
    b.extraShoulder = b.extraShoulder === name ? '' : name;
    this.refresh();
  },

  onTapBackkeyCount(e) {
    const value = e.currentTarget.dataset.value;
    const b = this.state.backkey;
    const same = b.count === value;
    b.count = same ? '' : value;
    b.keycaps = [];
    b.positions = [];
    this.refresh();
  },

  onTapKeycap(e) {
    const name = e.currentTarget.dataset.name;
    const b = this.state.backkey;
    if (!b.count) return;
    const max = b.count === '4' ? 2 : 1;
    const i = b.keycaps.indexOf(name);
    if (i === -1) {
      b.keycaps.push(name);
      while (b.keycaps.length > max) b.keycaps.shift();
    } else {
      b.keycaps.splice(i, 1);
    }
    this.refresh();
  },

  onTapPosition(e) {
    const name = e.currentTarget.dataset.name;
    const b = this.state.backkey;
    if (!b.count) return;
    const hasDse = b.keycaps.indexOf('DSE金属豆子键帽') !== -1 ||
      b.keycaps.indexOf('DSE金属拨片键帽') !== -1;
    if (name === '背键34号位置' && !hasDse) return;
    const max = b.count === '4' ? 2 : 1;
    const i = b.positions.indexOf(name);
    if (i === -1) {
      b.positions.push(name);
      while (b.positions.length > max) {
        const idx = b.positions.findIndex(p => p !== '背键34号位置');
        if (idx === -1) break;
        b.positions.splice(idx, 1);
      }
    } else {
      b.positions.splice(i, 1);
    }
    this.refresh();
  },

  onToggleSpecial(e) {
    const name = e.currentTarget.dataset.name;
    const b = this.state.backkey;
    if (name === 'FN摇杆微动背键') b.fn = !b.fn;
    else if (name === '麦克风微动背键') b.mic = !b.mic;
    else if (name === cfg.HEN_CHIP) b.hen = !b.hen;
    this.refresh();
  },

  onErgaiInput(e) {
    this.state.ergaiRequirement = e.detail.value;
    this.setData({ ergaiRequirement: e.detail.value });
  },

  /* ================= 导航 ================= */
  onJump(e) {
    this.data.step = e.currentTarget.dataset.index;
    this.refresh();
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  onPrev() {
    const list = this.visibleSteps();
    const pos = list.indexOf(this.data.step);
    if (pos > 0) {
      this.data.step = list[pos - 1];
      this.refresh();
      wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    }
  },

  onNext() {
    const list = this.visibleSteps();
    const pos = list.indexOf(this.data.step);
    if (pos < list.length - 1) {
      this.data.step = list[pos + 1];
      this.refresh();
      wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    } else {
      this.setData({ showPanel: true });
    }
  },

  onSkip() {
    const s = this.state;
    const step = this.data.step;
    if (step === 1) {
      s.shell = ''; s.shellColor = ''; s.bo5Style = ''; s.otherShell = ''; s.midframe = '';
    } else if (step === 2) {
      s.accessories = [];
    } else if (step === 3) {
      s.upgrades = [];
    } else if (step === 4) {
      s.stick = ''; s.damping = '';
    } else if (step === 5) {
      s.dpad = { type: '', force: '', config: '', color: '' };
    } else if (step === 6) {
      s.interact = { type: '', force: '', config: '', color: '' };
    } else if (step === 7) {
      s.shoulder = { type: '', force: '', config: '' };
    } else if (step === 8) {
      s.trigger = { type: '', config: '' };
    } else if (step === 9) {
      s.backkey = { count: '', keycaps: [], positions: [], extraShoulder: '', fn: false, mic: false, hen: false };
    }
    this.refresh();
    this.onNext();
  },

  /* ================= 配置单 ================= */
  onOpenPanel() {
    this.setData({ showPanel: true });
  },

  onClosePanel() {
    this.setData({ showPanel: false });
  },

  onPreview(e) {
    this.setData({ previewSrc: e.currentTarget.dataset.src });
  },

  onClosePreview() {
    this.setData({ previewSrc: '' });
  },

  noop() {},

  onCopyOrder() {
    const s = this.state;
    const result = priceLib.compute(s);
    if (result.missing.length) {
      wx.showToast({ title: '请选择' + result.missing[0], icon: 'none' });
      return;
    }
    let text = '花明楼改装配置 · 配置报价单\n';
    result.items.forEach(it => { text += '· ' + it.name + '：' + it.price + '元\n'; });
    if (priceLib.isErGai(s) && s.ergaiRequirement.trim()) {
      text += '二改要求：' + s.ergaiRequirement.trim() + '\n';
    }
    text += '合计：' + result.total + '元';
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '配置单已复制', icon: 'success' })
    });
  }
});

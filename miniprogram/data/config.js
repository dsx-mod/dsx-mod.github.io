/**
 * 配置页数据（与网站 index.html 的选项、说明、图片保持一致）
 * 价格不写在这里，统一从 data/prices.js 读取，避免两处价格不一致。
 */

const IMG = '/images/';

const STEP_TITLES = [
  '手柄主板',
  '外壳选择',
  '其他配件',
  '选配升级',
  '摇杆选配',
  '十字键改装',
  '交互键改装',
  '肩键改装',
  '扳机键改装',
  '背键改装'
];

// 选配升级步骤只在以下主板时显示
const UPGRADE_BOARDS = ['GNS明日香主板', 'ProShock主板', '氦闪2主板', '自备主板'];
// 可选「双切热插拔微动」的主板
const DUAL_TRIGGER_BOARDS = ['GNS明日香主板', '氦闪2主板', '自备主板'];

const MOTHERBOARDS = [
  { name: '氦闪主板', img: IMG + 'hs.jpg', desc: '8K回报，12bit摇杆，8键背键自定义(无线性扳机、震动、触摸板、陀螺仪)，不带摇杆' },
  { name: '氦闪2主板', img: IMG + 'hs2.jpg', desc: '8K回报，16bit摇杆，8键背键自定义(有线性扳机、震动、陀螺仪，可选配触摸板)，不带摇杆' },
  { name: 'GNS明日香主板', img: IMG + 'gns.jpg', desc: '支持PS、XSX系列主机。1K回报，16bit摇杆，全键+12背键自定义(含线性扳机、陀螺仪、2键触摸板选装，无震动)，不带摇杆' },
  { name: '速跃主板', img: IMG + 'suiovo.jpg', desc: '8K回报，14bit摇杆，8键背键自定义(无线性扳机、震动、触摸板、陀螺仪)，不带摇杆' },
  { name: 'ProShock主板', img: IMG + 'proshock.jpg', desc: '8K回报，14bit摇杆，8键背键自定义(无线性扳机、震动、触摸板、陀螺仪)，不带摇杆' },
  { name: '自备主板', desc: '自备非全新需要收20元处理费' },
  { name: '二改手柄' }
];

const GALLERY = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', 'dse.jpg', '4key.jpg', 'slice.jpg', 'round1.jpg']
  .map(f => IMG + f);

const MIDFRAME = ['原装中框按键', '国产中框按键'];

const SHELLS = [
  {
    name: '振飞扬国产外壳',
    img: IMG + 'zfy.jpg',
    desc: '国产塑料壳，无类肤，自带TYPEC口，无需额外选择',
    colors: ['黑色', '白色']
  },
  {
    name: '欧升腾国产类肤壳',
    img: IMG + 'ost.jpg',
    desc: '国产类肤壳，非TYPEC口',
    colors: ['黑色', '白色', '紫色']
  },
  {
    name: 'BO5国产外壳',
    img: IMG + 'bo5.jpg',
    desc: '默认带TYPEC接口，当自行邮寄提供面壳（如EXR面壳），仅需选择背壳即可',
    styles: ['艾许', '瓦尔基里', '电妹', 'D.VA', '恶灵', '初号机', '二号机', '血缘', '樱花白', '恋柱粉', '动力小子', '探路者', '地平线', '樱花粉', '纪念灰'],
    backShells: ['黑类肤背壳', '白类肤背壳', '黑点防滑背壳', '红点防滑背壳']
  },
  {
    name: '其他外壳',
    desc: '',
    otherOptions: ['自备外壳', '喷漆外壳'],
    otherDescs: {
      '自备外壳': '使用外壳存在公差较大，卡键等问题时，将加收20元处理费',
      '喷漆外壳': '推荐藕片定制涂装喷漆。价格包含邮寄喷漆快递费，一个原装外壳，外壳处理费，外壳喷漆费另计约300~400元/个。'
    }
  }
];

// 外壳图片：BO5 使用 bo5.jpg，其他外壳喷漆显示藕片图
const SHELL_EXTRA_IMAGES = {
  'oupian': IMG + 'oupian.jpg'
};

const ACCESSORIES = [
  { name: '微动排线插座升级', img: IMG + 'plug.jpg', note: '花明楼排线自带插座，无需选择。仅为老排线升级使用。', onlyErGai: true },
  { name: 'TYPEC接口制作', img: IMG + 'typec.jpg' },
  { name: '摇杆下压微动', img: IMG + 'LR3-down.jpg' },
  { name: '菜单背包微动', img: IMG + 'share.jpg', note: 'GNS主板自带菜单背包微动', disabledOnGns: true },
  { name: '触摸板改微动' },
  { name: 'PS键微动', img: IMG + 'PS.jpg' },
  { name: '动感指尖2摇杆帽', img: IMG + 'stick.jpg' }
];

const UPGRADES = [
  { name: '触摸板', boards: ['GNS明日香主板', '氦闪2主板'], img: IMG + 'touchpad.jpg' },
  { name: '显示屏', boards: ['GNS明日香主板', 'ProShock主板'], img: IMG + 'screen.jpg' },
  { name: '蓝牙模块', boards: ['ProShock主板'] },
  { name: '无线及蓝牙模块', boards: ['GNS明日香主板'], img: IMG + 'reciver.jpg' },
  { name: '2.4G无线模块', boards: ['ProShock主板'], img: IMG + 'reciver.jpg' },
  { name: '体感陀螺仪', boards: ['ProShock主板'] },
  { name: '震动马达', boards: ['氦闪2主板'] }
];

const STICKS = [
  { name: 'alps蓝边摇杆' },
  { name: 'DS13MAX摇杆', desc: '阻尼略小，约alps原装阻尼-20%，中心阻力均匀' },
  { name: 'JS13PRO+摇杆', desc: '阻尼略大，接近alps原装阻尼，中心阻力略有变化' },
  { name: '锦富霍尔摇杆' }
];

// 非 alps 摇杆不支持减阻尼
const TMR_STICKS = ['DS13MAX摇杆', 'JS13PRO+摇杆', '锦富霍尔摇杆'];

const DAMPINGS = [
  { name: '原装阻尼', label: '原装阻尼' },
  { name: '-15%阻尼', label: '-15%' },
  { name: '-20%阻尼', label: '-20%' },
  { name: '-30%阻尼', label: '-30%' },
  { name: '-40%阻尼', label: '-40%' }
];

const MODULE_TYPES = ['凯隆小微动', '热插拔大微动', '模块微动', '原装软胶垫'];
const FORCES = ['65g', '90g', '120g', '160g'];
const COLORS = ['黑色', '白色'];

// 十字键 / 交互键不同类型的图片
const DPAD_IMAGES = {
  '凯隆小微动': IMG + 'direct.jpg',
  '热插拔大微动': IMG + 'direction-hotkey.jpg',
  '模块微动': IMG + 'direct-plug.jpg'
};
const INTERACT_IMAGES = {
  '凯隆小微动': IMG + 'abxy.jpg',
  '热插拔大微动': IMG + 'abxy-hotkey.jpg',
  '模块微动': IMG + 'abxy-plug.jpg'
};
const COLOR_IMAGES = { '黑色': IMG + 'Bkey.jpg', '白色': IMG + 'Wkey.jpg' };

const SHOULDERS = [
  { name: '肩键改装 凯隆普通微动', label: '凯隆普通微动', img: IMG + 'LR1.jpg' },
  { name: '肩键改装 凯隆弹片微动', label: '凯隆弹片微动', img: IMG + 'LR1-new.jpg' },
  { name: '肩键改装 热插拔大微动', label: '热插拔大微动', img: IMG + 'LR1-hot.jpg' },
  { name: '肩键改装 保留原装硅胶垫', label: '保留原装硅胶垫' }
];

const TRIGGERS = [
  { name: '扳机键改装 凯隆普通微动', label: '凯隆普通微动', img: IMG + 'LR2.jpg' },
  { name: '扳机键改装 热插拔大微动', label: '热插拔大微动', img: IMG + 'LR2-hot.jpg' },
  { name: '扳机键改装 双切热插拔微动', label: '双切热插拔微动', img: IMG + 'LR2-dual.jpg' },
  { name: '扳机键改装 保留原装线性扳机', label: '保留原装线性扳机' }
];

const EXTRA_SHOULDERS = ['2键蝶式微动肩键', '4键蝶式微动肩键'];
const BACKKEY_COUNTS = [
  { value: '2', name: '2个背键' },
  { value: '4', name: '4个背键' }
];
const KEYCAPS = ['刀片键帽', '大圆点键帽', 'DSE金属豆子键帽', 'DSE金属拨片键帽', '嵌入圆点键帽'];
const POSITIONS = ['背键34号位置', '背键56号位置', '背键78号位置'];
const SPECIAL_BACKKEYS = [
  { name: 'FN摇杆微动背键', img: IMG + 'fn.jpg' },
  { name: '麦克风微动背键', gnsOnly: true }
];
const HEN_CHIP = 'HEN版本芯片';

// 图片（背键页）
const BACKKEY_IMAGES = {
  '2键蝶式微动肩键': IMG + '2key.jpg',
  '4键蝶式微动肩键': IMG + '4key.jpg',
  'dse-both': IMG + 'dse.jpg',
  'dse-paddle': IMG + 'dseb.jpg',
  'dse-bean': IMG + 'dsea.jpg',
  'positions': IMG + 'Bset.jpg'
};
const KEYCAP_IMAGES = {
  '刀片键帽': IMG + 'slice.jpg',
  '大圆点键帽': IMG + 'round.jpg',
  '嵌入圆点键帽': IMG + 'round1.jpg'
};

module.exports = {
  STEP_TITLES,
  UPGRADE_BOARDS,
  DUAL_TRIGGER_BOARDS,
  MOTHERBOARDS,
  GALLERY,
  MIDFRAME,
  SHELLS,
  SHELL_EXTRA_IMAGES,
  ACCESSORIES,
  UPGRADES,
  STICKS,
  TMR_STICKS,
  DAMPINGS,
  MODULE_TYPES,
  FORCES,
  COLORS,
  DPAD_IMAGES,
  INTERACT_IMAGES,
  COLOR_IMAGES,
  SHOULDERS,
  TRIGGERS,
  EXTRA_SHOULDERS,
  BACKKEY_COUNTS,
  KEYCAPS,
  POSITIONS,
  SPECIAL_BACKKEYS,
  HEN_CHIP,
  BACKKEY_IMAGES,
  KEYCAP_IMAGES
};

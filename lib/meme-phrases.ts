// 热梗推荐文案数据
export const MEME_PHRASES = [
  '我真的会谢',
  '栓Q了',
  '破防了',
  '几个钱就要我卖命？',
  '别惹我',
  '有Bing吗',
  '吃我一拳',
  '躺平',
  '摆烂',
  'emo了',
  '蚌埠住了',
  '夺笋啊',
  '好家伙',
  '离谱',
  '离谱到家了',
  '这很难评',
  '我裂开了',
  '小丑竟是我自己',
  '打工人打工魂',
  '干饭人干饭魂',
  '平静PEACE',
  '死嘴快说',
  '太真实了',
  'who TM cares',
  '我人傻了',
  '这谁顶得住',
  '我直接裂开',
  '爱你老己',
  '敬你老几',
  '你的脑子掉了',
  '你看，又改',
  '你看，又拖',
  '你看，又催',
  '从从容容游刃有余',
  '匆匆忙忙连滚带爬',
  '回家吧孩子',
  '高雅人士',
  '做完你的做你的',
  'gogogo出发咯',
  '我不行了',
  '误闯天家',
  '喝点丝瓜汤吧',
  '心理委员呢俺不得劲',
  '当个事儿办',
  '没福硬享',
  '如何呢 又能怎',
  '那咋了',
  '爱你老己，明天见',
  'Dirty Work',
  '我不是天才吗',
];

/**
 * 随机获取指定数量的热梗
 * @param count 需要获取的数量，默认3条
 * @returns 随机选择的热梗数组
 */
export function getRandomMemePhrases(count: number = 3): string[] {
  const shuffled = [...MEME_PHRASES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, MEME_PHRASES.length));
}




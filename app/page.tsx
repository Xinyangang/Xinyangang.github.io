'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Matter from 'matter-js';

// 静态背景图片组件
function StaticBackground() {
  return (
    <div 
      className="fixed inset-0 w-full h-full z-0 overflow-hidden"
      style={{
        backgroundImage: 'url(/images/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}

// 标题组件 - 使用 SVG 图片
function TitleComponent() {
  const [isHovered, setIsHovered] = useState(false);

  const baseHeight = 128;
  const mixMHeight = baseHeight * 0.9808;
  const mixHeight = baseHeight;
  const mojiHeight = mixMHeight / 0.6760;

  return (
    <motion.div
      className="flex items-start justify-center mb-8 pointer-events-auto cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        filter: isHovered ? 'url(#gooey)' : 'none',
        transition: 'filter 0.3s ease-out',
      }}
    >
      <motion.div
        className="relative"
        style={{ display: 'inline-block' }}
        animate={{ x: isHovered ? 40 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <img
          src="/images/Mix.svg"
          alt="Mix"
          className="w-auto select-none"
          style={{ display: 'block', pointerEvents: 'none', height: `${mixHeight}px` }}
        />
      </motion.div>
      <motion.div
        className="relative"
        style={{ display: 'inline-block' }}
        animate={{ x: isHovered ? -40 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <img
          src="/images/Moji.svg"
          alt="Moji"
          className="w-auto select-none"
          style={{ display: 'block', pointerEvents: 'none', height: `${mojiHeight}px` }}
        />
      </motion.div>
    </motion.div>
  );
}

// 表情包图片列表
const COVER_EMOJI_IMAGES = Array.from({ length: 16 }, (_, i) => `/images/cover_emoji/${i + 1}.png`);

// 星星接口
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
}

// 表情包物理状态
interface EmojiState {
  id: number;
  x: number;
  y: number;
  angle: number;
  imagePath: string;
  size: number;
  opacity: number;
}

export default function Home() {
  const [stars, setStars] = useState<Star[]>([]);
  const [emojiStates, setEmojiStates] = useState<EmojiState[]>([]);
  const starIdRef = useRef(0);
  
  // Matter.js 引用
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);

  // 初始化 Matter.js 物理引擎
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const Engine = Matter.Engine;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Runner = Matter.Runner;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;

    // 创建引擎（降低重力使下落更慢）
    const engine = Engine.create({
      gravity: { x: 0, y: 0.4 }, // 降低重力
    });
    engineRef.current = engine;

    const world = engine.world;

    // 屏幕尺寸
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 创建地面和墙壁（不可见）
    const ground = Bodies.rectangle(width / 2, height + 30, width * 2, 60, {
      isStatic: true,
      friction: 0.8,
      restitution: 0.3,
    });

    const leftWall = Bodies.rectangle(-30, height / 2, 60, height * 2, {
      isStatic: true,
    });

    const rightWall = Bodies.rectangle(width + 30, height / 2, 60, height * 2, {
      isStatic: true,
    });

    World.add(world, [ground, leftWall, rightWall]);

    // 创建表情包球体
    const emojiBodies: Matter.Body[] = [];
    const avgSize = 140; // 平均尺寸用于计算初始位置

    COVER_EMOJI_IMAGES.forEach((imagePath, index) => {
      // 随机初始位置（屏幕上方）
      const x = Math.random() * (width - avgSize) + avgSize / 2;
      const initialY = -150 - Math.random() * 600; // 从屏幕上方不同高度掉落
      const size = 120 + Math.random() * 40; // 120-160px 随机大小

      const body = Bodies.circle(x, initialY, size / 2, {
        restitution: 0.5, // 弹性
        friction: 0.1,
        frictionAir: 0.02, // 增加空气阻力使下落更慢
        density: 0.001,
        label: `emoji-${index}`,
      });

      // 存储额外数据（包括初始Y位置用于计算透明度）
      (body as any).emojiData = {
        imagePath,
        size,
        id: index,
        initialY: initialY, // 记录初始Y位置
      };

      emojiBodies.push(body);
    });

    World.add(world, emojiBodies);
    bodiesRef.current = emojiBodies;

    // 添加鼠标控制
    if (sceneRef.current) {
      const mouse = Mouse.create(sceneRef.current);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: { visible: false },
        },
      });
      
      // 禁用默认的拖拽，只检测悬停
      mouseConstraint.constraint.stiffness = 0;
      
      World.add(world, mouseConstraint);
      mouseConstraintRef.current = mouseConstraint;

      // 监听鼠标移动，实现弹开效果
      const handleMouseMove = (e: MouseEvent) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const pushRadius = 80; // 推力作用半径
        const pushForce = 0.08; // 推力大小

        emojiBodies.forEach((body) => {
          const dx = body.position.x - mouseX;
          const dy = body.position.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const bodyRadius = (body as any).emojiData?.size / 2 || 50;

          if (distance < pushRadius + bodyRadius && distance > 0) {
            // 计算推力方向和大小
            const forceMagnitude = pushForce * (1 - distance / (pushRadius + bodyRadius));
            const forceX = (dx / distance) * forceMagnitude;
            const forceY = (dy / distance) * forceMagnitude;

            Matter.Body.applyForce(body, body.position, { x: forceX, y: forceY });
          }
        });
      };

      window.addEventListener('mousemove', handleMouseMove);

      // 创建 Runner
      const runner = Runner.create();
      Runner.run(runner, engine);

      // 非线性缓动函数 (ease-out cubic)
      const easeOutCubic = (t: number): number => {
        return 1 - Math.pow(1 - t, 3);
      };

      // 更新渲染状态
      const updateStates = () => {
        const newStates = emojiBodies.map((body) => {
          const emojiData = (body as any).emojiData;
          const initialY = emojiData.initialY;
          const currentY = body.position.y;
          
          // 计算下落进度 (0 到 1)
          // 从初始位置到地面的距离
          const totalDistance = height - initialY;
          const currentDistance = currentY - initialY;
          let progress = Math.min(1, Math.max(0, currentDistance / totalDistance));
          
          // 应用非线性缓动
          const easedProgress = easeOutCubic(progress);
          
          // 透明度从 0.3 变化到 0.9
          const opacity = 0.3 + easedProgress * 0.6;
          
          return {
            id: emojiData.id,
            x: body.position.x,
            y: body.position.y,
            angle: body.angle,
            imagePath: emojiData.imagePath,
            size: emojiData.size,
            opacity: opacity,
          };
        });
        setEmojiStates(newStates);
        requestAnimationFrame(updateStates);
      };
      updateStates();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        Runner.stop(runner);
        World.clear(world, false);
        Engine.clear(engine);
      };
    }
  }, []);

  // 追踪鼠标位置，创建星星拖尾
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newStar: Star = {
        id: starIdRef.current++,
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 8 + 4,
      };

      setStars((prev) => [...prev.slice(-20), newStar]);

      setTimeout(() => {
        setStars((prev) => prev.filter((star) => star.id !== newStar.id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden" ref={sceneRef}>
      {/* 静态背景图片 */}
      <StaticBackground />

      {/* 表情包渲染 */}
      {emojiStates.map((emoji) => (
        <div
          key={emoji.id}
          className="absolute pointer-events-none"
          style={{
            left: emoji.x - emoji.size / 2,
            top: emoji.y - emoji.size / 2,
            width: emoji.size,
            height: emoji.size,
            transform: `rotate(${emoji.angle}rad)`,
            opacity: emoji.opacity,
            zIndex: 20,
          }}
        >
          <img
            src={emoji.imagePath}
            alt={`emoji-${emoji.id}`}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      ))}

      {/* 星星拖尾特效 */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="star-trail pointer-events-none"
          style={{
            left: `${star.x}px`,
            top: `${star.y}px`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
        />
      ))}

      {/* SVG Gooey Filter */}
      <svg className="absolute w-0 h-0" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="gooey" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pointer-events-none">
        <TitleComponent />
        
        {/* 副标题 */}
        <motion.p
          className="text-white text-xl font-medium mb-8 -mt-4 text-center px-4 pointer-events-auto"
          style={{
            backgroundClip: 'unset',
            WebkitBackgroundClip: 'unset',
            color: 'rgba(255, 255, 255, 1)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="inline-block mx-1">✨</span>
          万物皆可emoji
          <span className="inline-block mx-1">✨</span>
          <br className="sm:hidden" />
          <span className="text-lg opacity-90">一个可以DIY属于你自己的emoji工具</span>
        </motion.p>
        
        {/* 开始体验按钮 */}
        <motion.button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/create';
            }
          }}
          className="px-12 py-4 text-white font-semibold text-lg rounded-full pointer-events-auto shadow-lg relative button-glow-border"
          style={{
            background: 'linear-gradient(90deg, #C77DFF 0%, #FF1493 100%)',
            boxShadow: '0 8px 24px rgba(199, 125, 255, 0.4), 0 4px 12px rgba(255, 20, 147, 0.3)',
            zIndex: 1,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 12px 32px rgba(199, 125, 255, 0.5), 0 6px 16px rgba(255, 20, 147, 0.4)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          开始体验
        </motion.button>
      </div>
    </main>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { RotateCw } from 'lucide-react';
import { getEmojiImagePath } from '@/lib/emoji-utils';
import { getRandomMemePhrases } from '@/lib/meme-phrases';
import { EMOJI_CATEGORIES } from '@/lib/emoji-categories';
import { DECORATION_CATEGORIES } from '@/lib/decoration-categories';

type ItemType = 'emoji' | 'text';

interface CanvasItem {
  id: string;
  type: ItemType;
  // Emoji相关
  emoji?: string;
  imagePath?: string;
  // Text相关
  text?: string;
  textColor?: string;
  backgroundColor?: string | null;
  strokeColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  // 通用属性
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
}

interface TextItem {
  id: string;
  text: string;
  textColor: string;
  backgroundColor: string | null;
  strokeColor: string;
  strokeWidth: number;
}

// 控制点类型（只保留4个角）
type HandleType = 'nw' | 'ne' | 'se' | 'sw'; // 西北、东北、东南、西南

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<'表情' | '装饰' | '文字'>('表情');
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandleType | 'rotate' | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  
  // 文字相关状态
  const [textItems, setTextItems] = useState<TextItem[]>([
    { id: 'text-1', text: '', textColor: '#FFFFFF', backgroundColor: null, strokeColor: '#000000', strokeWidth: 6 }
  ]);
  const [memePhrases, setMemePhrases] = useState<string[]>(getRandomMemePhrases(3));
  
  // 表情分类展开/收起状态 - 默认只展开第一个分类
  const [expandedEmojiCategories, setExpandedEmojiCategories] = useState<Set<string>>(
    new Set(EMOJI_CATEGORIES.length > 0 ? [EMOJI_CATEGORIES[0].name] : [])
  );
  
  // 装饰分类展开/收起状态 - 默认只展开第一个分类
  const [expandedDecorationCategories, setExpandedDecorationCategories] = useState<Set<string>>(
    new Set(DECORATION_CATEGORIES.length > 0 ? [DECORATION_CATEGORIES[0].name] : [])
  );
  
  // 使用指南气泡显示状态
  const [showGuide, setShowGuide] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  
  // 灵感弹窗显示状态
  const [showInspiration, setShowInspiration] = useState(false);
  
  // 示例图片列表
  const EXAMPLE_IMAGES = [
    '/images/examples/01.png',
    '/images/examples/02.png',
    '/images/examples/03.png',
    '/images/examples/04.png',
    '/images/examples/05.png',
    '/images/examples/06.png',
    '/images/examples/07.png',
    '/images/examples/08.png',
    '/images/examples/09.png',
    '/images/examples/010.png',
    '/images/examples/011.png',
    '/images/examples/012.png',
    '/images/examples/013.png',
    '/images/examples/014.png',
    '/images/examples/015.png',
    '/images/examples/016.png',
  ];
  
  // 点击外部关闭使用指南气泡
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (guideRef.current && !guideRef.current.contains(e.target as Node)) {
        setShowGuide(false);
      }
    };
    
    if (showGuide) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGuide]);
  
  // 切换表情分类展开/收起
  const toggleEmojiCategory = (categoryName: string) => {
    setExpandedEmojiCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };
  
  // 切换装饰分类展开/收起
  const toggleDecorationCategory = (categoryName: string) => {
    setExpandedDecorationCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  // 处理点击表情，添加到画布
  const handleEmojiClick = (imagePath: string, emojiName?: string) => {
    const canvasSize = 600;
    // emoji 的基础字体大小（约为120px）
    const emojiBaseSize = 120;
    // 蓝色方框的 padding（让方框贴近emoji但不重叠）
    const padding = 15;
    // 蓝色方框的大小 = emoji大小 + padding
    const itemSize = emojiBaseSize + padding * 2;
    
    const newItem: CanvasItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      type: 'emoji',
      imagePath: imagePath,
      x: (canvasSize - itemSize) / 2,
      y: (canvasSize - itemSize) / 2,
      width: itemSize,
      height: itemSize,
      rotation: 0,
      scale: 1,
    };

    setCanvasItems([...canvasItems, newItem]);
    setSelectedItemId(newItem.id);
  };

  // 文字容器的固定内边距（确保边框与文字边界距离一致）
  const TEXT_PADDING = 10;

  // 计算文字尺寸（包括描边）
  const calculateTextSize = (text: string, fontSize: number = 40, strokeWidth: number = 2): { width: number; height: number } => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return { width: 0, height: 0 };
    
    tempCtx.font = `bold ${fontSize}px Arial, sans-serif`;
    const metrics = tempCtx.measureText(text);
    // 考虑描边宽度，描边会向内外扩展
    const strokePadding = strokeWidth * 2;
    return {
      width: metrics.width + strokePadding,
      height: fontSize * 1.2 + strokePadding, // 考虑行高和描边
    };
  };

  // 处理文字输入变化
  const handleTextChange = (textId: string, text: string) => {
    setTextItems(items =>
      items.map(item => item.id === textId ? { ...item, text } : item)
    );
    
    // 如果文字不为空，更新或创建画布上的文字项
    if (text.trim()) {
      const textItem = textItems.find(item => item.id === textId);
      if (textItem) {
        const existingCanvasItem = canvasItems.find(item => item.id === textId);
        const fontSize = existingCanvasItem?.fontSize || 40;
        const strokeWidth = textItem.strokeWidth || 2;
        const { width: textWidth, height: textHeight } = calculateTextSize(text, fontSize, strokeWidth);
        const padding = TEXT_PADDING;
        
        if (existingCanvasItem) {
          // 更新现有文字项，保持位置中心不变
          const centerX = existingCanvasItem.x + existingCanvasItem.width / 2;
          const centerY = existingCanvasItem.y + existingCanvasItem.height / 2;
          const newWidth = textWidth + padding * 2;
          const newHeight = textHeight + padding * 2;
          
          setCanvasItems(items =>
            items.map(item =>
              item.id === textId
                ? {
                    ...item,
                    text,
                    textColor: textItem.textColor,
                    backgroundColor: textItem.backgroundColor,
                    strokeColor: textItem.strokeColor,
                    strokeWidth: textItem.strokeWidth,
                    width: newWidth,
                    height: newHeight,
                    x: centerX - newWidth / 2,
                    y: centerY - newHeight / 2,
                  }
                : item
            )
          );
        } else {
          // 创建新文字项
          const canvasSize = 600;
          const strokeWidth = textItem.strokeWidth || 2;
          const { width: textWidth, height: textHeight } = calculateTextSize(text, fontSize, strokeWidth);
          const padding = TEXT_PADDING;
          const newItem: CanvasItem = {
            id: textId,
            type: 'text',
            text,
            textColor: textItem.textColor,
            backgroundColor: textItem.backgroundColor,
            strokeColor: textItem.strokeColor,
            strokeWidth: textItem.strokeWidth,
            fontSize,
            x: (canvasSize - textWidth - padding * 2) / 2,
            y: (canvasSize - textHeight - padding * 2) / 2,
            width: textWidth + padding * 2,
            height: textHeight + padding * 2,
            rotation: 0,
            scale: 1,
          };
          
          setCanvasItems([...canvasItems, newItem]);
          setSelectedItemId(textId);
        }
      }
    } else {
      // 如果文字为空，从画布中移除
      setCanvasItems(items => items.filter(item => item.id !== textId));
      if (selectedItemId === textId) {
        setSelectedItemId(null);
      }
    }
  };

  // 处理文字样式变化
  const handleTextStyleChange = (textId: string, style: Partial<TextItem>) => {
    setTextItems(items =>
      items.map(item => item.id === textId ? { ...item, ...style } : item)
    );
    
    // 同步更新画布上的文字项
    setCanvasItems(items =>
      items.map(item => {
        if (item.id !== textId || item.type !== 'text' || !item.text) return item;
        
        // 获取更新后的样式
        const updatedTextItem = textItems.find(ti => ti.id === textId);
        if (!updatedTextItem) return item;
        
        const newTextColor = style.textColor ?? item.textColor;
        const newBackgroundColor = style.backgroundColor !== undefined ? style.backgroundColor : item.backgroundColor;
        const newStrokeColor = style.strokeColor ?? item.strokeColor;
        const newStrokeWidth = style.strokeWidth ?? item.strokeWidth;
        
        // 如果描边宽度变化，需要重新计算尺寸
        if (style.strokeWidth !== undefined && style.strokeWidth !== item.strokeWidth) {
          const fontSize = item.fontSize || 40;
          const { width: textWidth, height: textHeight } = calculateTextSize(item.text, fontSize, newStrokeWidth);
          const padding = TEXT_PADDING;
          
          // 保持中心点不变
          const centerX = item.x + item.width / 2;
          const centerY = item.y + item.height / 2;
          const newWidth = textWidth + padding * 2;
          const newHeight = textHeight + padding * 2;
          
          return {
            ...item,
            textColor: newTextColor,
            backgroundColor: newBackgroundColor,
            strokeColor: newStrokeColor,
            strokeWidth: newStrokeWidth,
            width: newWidth,
            height: newHeight,
            x: centerX - newWidth / 2,
            y: centerY - newHeight / 2,
          };
        }
        
        return {
          ...item,
          textColor: newTextColor,
          backgroundColor: newBackgroundColor,
          strokeColor: newStrokeColor,
          strokeWidth: newStrokeWidth,
        };
      })
    );
  };

  // 添加新文字项
  const handleAddText = () => {
    const newId = `text-${textItems.length + 1}`;
    setTextItems([
      ...textItems,
      { id: newId, text: '', textColor: '#FFFFFF', backgroundColor: null, strokeColor: '#000000', strokeWidth: 6 }
    ]);
  };

  // 删除文字项
  const handleDeleteText = (textId: string) => {
    setTextItems(items => items.filter(item => item.id !== textId));
    setCanvasItems(items => items.filter(item => item.id !== textId));
    if (selectedItemId === textId) {
      setSelectedItemId(null);
    }
  };

  // 刷新热梗推荐
  const handleRefreshMemePhrases = () => {
    setMemePhrases(getRandomMemePhrases(3));
  };

  // 复制热梗
  const handleCopyMemePhrase = (phrase: string) => {
    navigator.clipboard.writeText(phrase).then(() => {
      // 可以添加提示
    });
  };

  // 使用热梗
  const handleUseMemePhrase = (phrase: string) => {
    const firstEmptyText = textItems.find(item => !item.text.trim());
    if (firstEmptyText) {
      handleTextChange(firstEmptyText.id, phrase);
    } else {
      // 如果没有空的文字项，添加到第一个
      if (textItems.length > 0) {
        handleTextChange(textItems[0].id, phrase);
      }
    }
  };

  // 监听键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
      
      // 删除选中项
      if (selectedItemId && (e.key === 'Delete' || e.key === 'Backspace')) {
        // 如果是文字项，同步清空左侧输入框的内容
        const selectedItem = canvasItems.find(item => item.id === selectedItemId);
        if (selectedItem?.type === 'text') {
          setTextItems(items =>
            items.map(item => item.id === selectedItemId ? { ...item, text: '' } : item)
          );
        }
        setCanvasItems(items => items.filter(item => item.id !== selectedItemId));
        setSelectedItemId(null);
        return;
      }
      
      // Command+] 移到最顶层
      if (selectedItemId && (e.metaKey || e.ctrlKey) && e.key === ']') {
        e.preventDefault();
        setCanvasItems(items => {
          const item = items.find(i => i.id === selectedItemId);
          if (!item) return items;
          // 移除该项，然后添加到数组末尾（最顶层）
          const filtered = items.filter(i => i.id !== selectedItemId);
          return [...filtered, item];
        });
        return;
      }
      
      // Command+[ 移到最底层
      if (selectedItemId && (e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        setCanvasItems(items => {
          const item = items.find(i => i.id === selectedItemId);
          if (!item) return items;
          // 移除该项，然后添加到数组开头（最底层）
          const filtered = items.filter(i => i.id !== selectedItemId);
          return [item, ...filtered];
        });
        return;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedItemId, canvasItems]);

  // 计算控制点位置（返回相对于 item 的本地坐标，不考虑旋转）
  // 只保留4个角的控制点
  const getHandleLocalPosition = (handle: HandleType, item: CanvasItem) => {
    switch (handle) {
      case 'nw':
        return { x: 0, y: 0 };
      case 'ne':
        return { x: item.width, y: 0 };
      case 'se':
        return { x: item.width, y: item.height };
      case 'sw':
        return { x: 0, y: item.height };
      default:
        return { x: 0, y: 0 };
    }
  };

  // 获取对面的角点（作为缩放中心）
  const getOppositeHandle = (handle: HandleType): HandleType => {
    switch (handle) {
      case 'nw': return 'se'; // 左上角 -> 右下角
      case 'ne': return 'sw'; // 右上角 -> 左下角
      case 'se': return 'nw'; // 右下角 -> 左上角
      case 'sw': return 'ne'; // 左下角 -> 右上角
    }
  };

  // 处理控制点拖拽开始（4个角的控制点用于等比例缩放）
  const handleHandleMouseDown = (e: React.MouseEvent, handle: HandleType, item: CanvasItem) => {
    e.stopPropagation();
    setActiveHandle(handle);
    setIsDragging(true);

    const startItem = { ...item };
    const oppositeHandle = getOppositeHandle(handle);
    
    // 获取画布的位置信息
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // 获取对面的角点位置（作为缩放中心，固定不动）
    // 需要计算旋转后的实际屏幕位置
    const oppositeLocalPos = getHandleLocalPosition(oppositeHandle, startItem);
    const itemCenterX = startItem.x + startItem.width / 2;
    const itemCenterY = startItem.y + startItem.height / 2;
    const rotationRad = (startItem.rotation * Math.PI) / 180;
    const cos = Math.cos(rotationRad);
    const sin = Math.sin(rotationRad);
    
    // 对面的角点相对于中心的本地坐标
    const oppositeLocalX = oppositeLocalPos.x - startItem.width / 2;
    const oppositeLocalY = oppositeLocalPos.y - startItem.height / 2;
    
    // 应用旋转，得到对面的角点在画布中的位置（作为缩放中心）
    const pivotX = itemCenterX + (oppositeLocalX * cos - oppositeLocalY * sin);
    const pivotY = itemCenterY + (oppositeLocalX * sin + oppositeLocalY * cos);

    // 获取初始拖拽点的位置（相对于画布）
    const initialHandleLocalPos = getHandleLocalPosition(handle, startItem);
    const initialLocalX = initialHandleLocalPos.x - startItem.width / 2;
    const initialLocalY = initialHandleLocalPos.y - startItem.height / 2;
    const initialHandleX = itemCenterX + (initialLocalX * cos - initialLocalY * sin);
    const initialHandleY = itemCenterY + (initialLocalX * sin + initialLocalY * cos);
    
    // 计算初始距离（从缩放中心到初始拖拽点）
    const initialDx = initialHandleX - pivotX;
    const initialDy = initialHandleY - pivotY;
    const initialDistance = Math.sqrt(initialDx * initialDx + initialDy * initialDy);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // 计算鼠标在画布中的位置
      const mouseX = moveEvent.clientX - canvasRect.left;
      const mouseY = moveEvent.clientY - canvasRect.top;
      
      // 计算从缩放中心（对面的角点）到鼠标位置的距离
      const dx = mouseX - pivotX;
      const dy = mouseY - pivotY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      
      if (initialDistance > 0) {
        // 计算缩放比例
        const scale = Math.max(0.2, Math.min(5, currentDistance / initialDistance));
        
        // 计算新的宽度和高度
        const newWidth = startItem.width * scale;
        const newHeight = startItem.height * scale;
        
        // 根据拖拽的角点和对面的角点，计算新的位置
        // 对面的角点在画布中的位置应该保持不变（考虑旋转）
        // 需要反推左上角的位置
        let newX: number;
        let newY: number;
        
        // 对面的角点在新尺寸下的本地坐标（未旋转）
        const newOppositeLocalX = (oppositeLocalPos.x / startItem.width) * newWidth;
        const newOppositeLocalY = (oppositeLocalPos.y / startItem.height) * newHeight;
        
        // 计算新的中心位置，使得对面的角点位置保持不变
        // pivotX = newCenterX + (newOppositeLocalX - newWidth/2) * cos - (newOppositeLocalY - newHeight/2) * sin
        // pivotY = newCenterY + (newOppositeLocalX - newWidth/2) * sin + (newOppositeLocalY - newHeight/2) * cos
        // 简化：对面的角点在新尺寸下的相对位置
        const relativeX = newOppositeLocalX - newWidth / 2;
        const relativeY = newOppositeLocalY - newHeight / 2;
        
        // 反推新的中心位置
        // 对于旋转矩阵的逆变换
        const newCenterX = pivotX - (relativeX * cos - relativeY * sin);
        const newCenterY = pivotY - (relativeX * sin + relativeY * cos);
        
        // 计算新的左上角位置
        newX = newCenterX - newWidth / 2;
        newY = newCenterY - newHeight / 2;
        
        // 应用边界限制（确保图片中心不超出画布）
        const canvasSize = 600;
        const centerX = newX + newWidth / 2;
        const centerY = newY + newHeight / 2;
        
        const minCenterX = newWidth / 2;
        const maxCenterX = canvasSize - newWidth / 2;
        const minCenterY = newHeight / 2;
        const maxCenterY = canvasSize - newHeight / 2;
        
        const clampedCenterX = Math.max(minCenterX, Math.min(centerX, maxCenterX));
        const clampedCenterY = Math.max(minCenterY, Math.min(centerY, maxCenterY));
        
        newX = clampedCenterX - newWidth / 2;
        newY = clampedCenterY - newHeight / 2;

        setCanvasItems(items =>
          items.map(i => {
            if (i.id !== item.id) return i;
            
            // 统一处理所有类型（文字、表情、装饰），只更新尺寸和位置
            // 文字的大小会根据容器高度在渲染时自动计算，就像图片一样
            return {
              ...i,
              width: newWidth,
              height: newHeight,
              x: newX,
              y: newY,
            };
          })
        );
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 处理旋转控制点拖拽
  const handleRotateMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    e.stopPropagation();
    setActiveHandle('rotate');
    setIsDragging(true);

    const startItem = { ...item };
    
    // 获取画布的位置信息
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // 元素中心点在画布中的坐标（旋转中心）
    const centerX = startItem.x + startItem.width / 2;
    const centerY = startItem.y + startItem.height / 2;
    
    // 计算初始鼠标位置在画布中的坐标
    const initialMouseX = e.clientX - canvasRect.left;
    const initialMouseY = e.clientY - canvasRect.top;
    
    // 计算初始角度（从中心到鼠标位置的角度，相对于画布坐标）
    const initialAngle = Math.atan2(
      initialMouseY - centerY,
      initialMouseX - centerX
    );
    
    // 初始旋转角度（弧度）
    const initialRotation = (startItem.rotation * Math.PI) / 180;
    // 初始角度减去当前旋转角度，得到相对于元素的初始角度
    const initialRelativeAngle = initialAngle - initialRotation;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // 计算当前鼠标位置在画布中的坐标
      const currentMouseX = moveEvent.clientX - canvasRect.left;
      const currentMouseY = moveEvent.clientY - canvasRect.top;
      
      // 计算当前鼠标相对于元素中心的角度（相对于画布坐标）
      const currentAngle = Math.atan2(
        currentMouseY - centerY,
        currentMouseX - centerX
      );
      
      // 计算新的旋转角度：当前角度减去初始相对角度
      let newRotationRad = currentAngle - initialRelativeAngle;
      let newRotationDeg = (newRotationRad * 180) / Math.PI;
      
      // 如果按住 Shift，则按 15 度步进
      if (moveEvent.shiftKey || isShiftPressed) {
        newRotationDeg = Math.round(newRotationDeg / 15) * 15;
      }
      
      // 标准化角度到 0-360 范围
      newRotationDeg = ((newRotationDeg % 360) + 360) % 360;

      setCanvasItems(items =>
        items.map(i => (i.id === item.id ? { ...i, rotation: newRotationDeg } : i))
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 处理项目拖拽（移动位置）
  const handleItemDrag = (item: CanvasItem, event: any, info: any) => {
    const canvasSize = 600;
    
    setCanvasItems(items => {
      return items.map(i => {
        if (i.id !== item.id) return i;
        
        // 计算新位置（使用当前状态中的位置）
        let newX = i.x + info.delta.x;
        let newY = i.y + info.delta.y;
        
        // 边界限制：确保图片中心不能超出画布边界
        // 图片中心 x = newX + i.width / 2
        // 图片中心 y = newY + i.height / 2
        
        // X轴边界限制：图片中心不能超出画布左边界和右边界
        // 中心 x 最小值：i.width / 2（不能小于画布左边界）
        // 中心 x 最大值：canvasSize - i.width / 2（不能大于画布右边界）
        const minCenterX = i.width / 2;
        const maxCenterX = canvasSize - i.width / 2;
        const centerX = newX + i.width / 2;
        const clampedCenterX = Math.max(minCenterX, Math.min(centerX, maxCenterX));
        newX = clampedCenterX - i.width / 2;
        
        // Y轴边界限制：图片中心不能超出画布上边界和下边界
        // 中心 y 最小值：i.height / 2（不能小于画布上边界）
        // 中心 y 最大值：canvasSize - i.height / 2（不能大于画布下边界）
        const minCenterY = i.height / 2;
        const maxCenterY = canvasSize - i.height / 2;
        const centerY = newY + i.height / 2;
        const clampedCenterY = Math.max(minCenterY, Math.min(centerY, maxCenterY));
        newY = clampedCenterY - i.height / 2;
        
        return { ...i, x: newX, y: newY };
      });
    });
  };

  // 获取控制点光标样式（角的控制点用于缩放）
  const getHandleCursor = (handle: HandleType) => {
    switch (handle) {
      case 'nw':
        return 'nwse-resize';
      case 'ne':
        return 'nesw-resize';
      case 'se':
        return 'nwse-resize';
      case 'sw':
        return 'nesw-resize';
      default:
        return 'pointer';
    }
  };

  // 单个画布项组件
  const CanvasItemComponent = ({ item }: { item: CanvasItem }) => {
    const isSelected = selectedItemId === item.id;

    return (
      <>
        <motion.div
          className="absolute"
          style={{
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            rotate: item.rotation,
            transformOrigin: 'center center',
          }}
          drag={!isDragging}
          dragMomentum={false}
          onDrag={(e, info) => handleItemDrag(item, e, info)}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDragging) {
              setSelectedItemId(item.id);
            }
          }}
          whileDrag={{ zIndex: 1000 }}
        >
          {item.type === 'emoji' ? (
            <div className="w-full h-full flex items-center justify-center select-none" style={{ userSelect: 'none', pointerEvents: 'none' }}>
              <img
                src={item.imagePath}
                alt={item.emoji}
                className="w-full h-full object-contain"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `<span style="font-size: ${item.width - 30}px; line-height: 1;">${item.emoji}</span>`;
                  }
                }}
              />
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center select-none"
              style={{
                userSelect: 'none',
                pointerEvents: 'none',
                backgroundColor: item.backgroundColor || 'transparent',
                padding: `${TEXT_PADDING}px`, // 固定内边距，确保边框与文字边界距离一致
              }}
            >
              <span
                style={{
                  color: item.textColor || '#000000',
                  // 根据容器高度动态计算字体大小，让文字像图片一样缩放
                  // 减去 padding (上下各 TEXT_PADDING)
                  fontSize: `${Math.max(12, (item.height - TEXT_PADDING * 2) * 0.7)}px`,
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  // 描边宽度也根据容器高度动态调整，保持描边比例
                  // 当 strokeWidth 为 0 时不显示描边
                  WebkitTextStroke: (item.strokeWidth || 0) > 0 
                    ? `${(item.strokeWidth || 0) * ((item.height - TEXT_PADDING * 2) / 40)}px ${item.strokeColor || '#000000'}`
                    : 'none',
                  paintOrder: 'stroke fill',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.text}
              </span>
            </div>
          )}
        </motion.div>

        {/* 选中边框和控制点 */}
        {isSelected && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
              rotate: item.rotation,
              transformOrigin: 'center center', // 旋转中心为 emoji 的中心
            }}
          >
            {/* 选中边框 - 更细的边框 */}
            <div
              className="absolute border border-blue-500"
              style={{
                left: -1,
                top: -1,
                width: item.width + 2,
                height: item.height + 2,
                borderRadius: '4px',
              }}
            />

            {/* 控制点（只显示4个角） */}
            {(['nw', 'ne', 'se', 'sw'] as HandleType[]).map((handle) => {
              const localPos = getHandleLocalPosition(handle, item);
              const size = 8;

              return (
                <div
                  key={handle}
                  className="absolute bg-blue-500 border border-white rounded-full pointer-events-auto shadow-sm"
                  style={{
                    left: localPos.x - size / 2,
                    top: localPos.y - size / 2,
                    width: size,
                    height: size,
                    cursor: getHandleCursor(handle),
                  }}
                  onMouseDown={(e) => handleHandleMouseDown(e, handle, item)}
                />
              );
            })}

            {/* 旋转控制图标（在item正上方） */}
            <div
              className="absolute pointer-events-auto cursor-grab bg-white rounded-full p-1.5 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
              style={{
                left: item.width / 2,
                top: -32, // item正上方
                transform: 'translateX(-50%)',
              }}
              onMouseDown={(e) => handleRotateMouseDown(e, item)}
            >
              <RotateCw size={16} className="text-blue-600" strokeWidth={2} />
            </div>
          </motion.div>
        )}
      </>
    );
  };

  // 导出图片
  const handleExportImage = async () => {
    if (!canvasRef.current) return;
    if (canvasItems.length === 0) {
      alert('画布中没有内容');
      return;
    }

    try {
      // 计算所有元素的边界框（考虑旋转）
      const getRotatedBounds = (item: CanvasItem) => {
        const centerX = item.x + item.width / 2;
        const centerY = item.y + item.height / 2;
        const halfWidth = item.width / 2;
        const halfHeight = item.height / 2;
        const rad = (item.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // 四个角点相对于中心的位置
        const corners = [
          { x: -halfWidth, y: -halfHeight },
          { x: halfWidth, y: -halfHeight },
          { x: halfWidth, y: halfHeight },
          { x: -halfWidth, y: halfHeight },
        ];

        // 旋转后的角点位置
        const rotatedCorners = corners.map(corner => ({
          x: centerX + corner.x * cos - corner.y * sin,
          y: centerY + corner.x * sin + corner.y * cos,
        }));

        return {
          minX: Math.min(...rotatedCorners.map(c => c.x)),
          maxX: Math.max(...rotatedCorners.map(c => c.x)),
          minY: Math.min(...rotatedCorners.map(c => c.y)),
          maxY: Math.max(...rotatedCorners.map(c => c.y)),
        };
      };

      // 计算所有元素的总边界
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      canvasItems.forEach(item => {
        const bounds = getRotatedBounds(item);
        minX = Math.min(minX, bounds.minX);
        minY = Math.min(minY, bounds.minY);
        maxX = Math.max(maxX, bounds.maxX);
        maxY = Math.max(maxY, bounds.maxY);
      });

      // 添加一点边距
      const padding = 10;
      minX -= padding;
      minY -= padding;
      maxX += padding;
      maxY += padding;

      const exportWidth = Math.ceil(maxX - minX);
      const exportHeight = Math.ceil(maxY - minY);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = exportWidth;
      canvas.height = exportHeight;

      // 透明背景 - 不填充任何颜色

      // 并行加载所有图片（仅emoji类型）
      const emojiItems = canvasItems.filter(item => item.type === 'emoji');
      const imagePromises = emojiItems.map((item) => {
        return new Promise<{ item: CanvasItem; img: HTMLImageElement | null }>((resolve) => {
          if (!item.imagePath) {
            resolve({ item, img: null });
            return;
          }
          const img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve({ item, img });
          img.onerror = () => resolve({ item, img: null });
          img.src = item.imagePath;
          
          if (img.complete) {
            resolve({ item, img });
          }
        });
      });
      
      const loadedImages = await Promise.all(imagePromises);

      // 绘制每个 canvas item（调整位置使其从 (0,0) 开始）
      for (const item of canvasItems) {
        ctx.save();
        
        // 移动到中心点（减去边界起点以调整位置）
        const centerX = item.x + item.width / 2 - minX;
        const centerY = item.y + item.height / 2 - minY;
        
        // 应用变换（先旋转，再平移）
        ctx.translate(centerX, centerY);
        ctx.rotate((item.rotation * Math.PI) / 180);
        
        if (item.type === 'emoji') {
          const loaded = loadedImages.find(li => li.item.id === item.id);
          if (loaded?.img) {
            // 绘制图片
            ctx.drawImage(loaded.img, -item.width / 2, -item.height / 2, item.width, item.height);
          } else if (item.imagePath) {
            // 如果图片加载失败，绘制占位符
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);
            ctx.fillStyle = '#666666';
            ctx.font = `${item.width * 0.3}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', 0, 0);
          }
        } else if (item.type === 'text' && item.text) {
          // 绘制文字背景
          if (item.backgroundColor) {
            ctx.fillStyle = item.backgroundColor;
            ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);
          }
          
          // 绘制文字描边（strokeWidth > 0 时才绘制）
          if (item.strokeColor && item.strokeWidth && item.strokeWidth > 0) {
            ctx.strokeStyle = item.strokeColor;
            ctx.lineWidth = item.strokeWidth;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.font = `bold ${item.fontSize || 40}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText(item.text, 0, 0);
          }
          
          // 绘制文字填充
          ctx.fillStyle = item.textColor || '#000000';
          ctx.font = `bold ${item.fontSize || 40}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.text, 0, 0);
        }
        
        ctx.restore();
      }

      // 将 canvas 转换为 blob 并下载
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meme-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  return (
    <div className="h-screen bg-[#F9FAFB] flex overflow-hidden">
      {/* 左侧功能区 */}
      <div className="w-[480px] bg-white border-r border-[#E5E7EB] flex flex-col h-full">
        {/* 标签栏 - 胶囊型切换 */}
        <div className="flex border-b border-[#E5E7EB] flex-shrink-0 px-6 py-4">
          <div className="flex w-full bg-[#F3F4F6] rounded-lg p-1">
            {(['表情', '装饰', '文字'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-1.5 text-center text-sm font-medium transition-all duration-200 rounded-md ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {activeTab === '表情' && (
            <div className="space-y-6">
              {EMOJI_CATEGORIES.map((category) => {
                const isExpanded = expandedEmojiCategories.has(category.name);
                return (
                  <div key={category.name} className="border-b border-[#E5E7EB] pb-6 last:border-b-0">
                    {/* 分类标题，可点击展开/收起 */}
                    <button
                      onClick={() => toggleEmojiCategory(category.name)}
                      className="w-full flex items-center justify-between py-2.5 hover:bg-slate-50 px-3 rounded-lg transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-slate-800">
                        {category.name}
                      </h3>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-400"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    </button>
                    
                    {/* 表情列表，使用动画展开/收起 */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-6 gap-4 mt-3">
                            {category.items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleEmojiClick(item.imagePath, item.name)}
                                className="w-14 h-14 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-200 cursor-pointer relative overflow-hidden hover:scale-105"
                                title={item.name}
                              >
                                <img
                                  src={item.imagePath}
                                  alt={item.name || item.id}
                                  className="w-full h-full object-contain"
                                  loading="lazy"
                                  onError={(e) => {
                                    // 如果图片加载失败，显示占位符
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.parentElement) {
                                      target.parentElement.innerHTML = '<span class="text-xs text-slate-400">?</span>';
                                    }
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === '装饰' && (
            <div className="space-y-6">
              {DECORATION_CATEGORIES.map((category) => {
                const isExpanded = expandedDecorationCategories.has(category.name);
                return (
                  <div key={category.name} className="border-b border-[#E5E7EB] pb-6 last:border-b-0">
                    {/* 分类标题，可点击展开/收起 */}
                    <button
                      onClick={() => toggleDecorationCategory(category.name)}
                      className="w-full flex items-center justify-between py-2.5 hover:bg-slate-50 px-3 rounded-lg transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-slate-800">
                        {category.name}
                      </h3>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-400"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    </button>
                    
                    {/* 装饰列表，使用动画展开/收起 */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-6 gap-4 mt-3">
                            {category.items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleEmojiClick(item.imagePath, item.name)}
                                className="w-14 h-14 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-200 cursor-pointer relative overflow-hidden hover:scale-105"
                                title={item.name}
                              >
                                <img
                                  src={item.imagePath}
                                  alt={item.name || item.id}
                                  className="w-full h-full object-contain"
                                  loading="lazy"
                                  onError={(e) => {
                                    // 如果图片加载失败，显示占位符
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.parentElement) {
                                      target.parentElement.innerHTML = '<span class="text-xs text-slate-400">?</span>';
                                    }
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === '文字' && (
            <div className="flex flex-col h-full">
              {/* 文字编辑区域 - 可滚动 */}
              <div className="flex-1 overflow-y-auto">
                {textItems.map((textItem, index) => (
                  <div key={textItem.id} className={`space-y-4 ${index > 0 ? 'mt-6 pt-6 border-t border-[#E5E7EB]' : ''}`}>
                    {/* 文字标题和删除按钮 */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-800">
                        文字{index + 1}
                      </h3>
                      {/* 文字2及之后显示删除按钮，无论是否有内容 */}
                      {index > 0 && (
                        <button
                          onClick={() => handleDeleteText(textItem.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-slate-100"
                          title="删除"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 4L4 12M4 4L12 12"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* 文字输入框 - 高度变窄，修复聚焦边框显示 */}
                    <textarea
                      value={textItem.text}
                      onChange={(e) => handleTextChange(textItem.id, e.target.value)}
                      placeholder="请输入内容"
                      className="w-full h-14 px-3 py-2 border-2 border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:border-blue-500 transition-colors bg-white"
                    />

                    {/* 颜色和样式控制 - 2x2 网格布局 */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* 文字颜色 */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-700 whitespace-nowrap">文字颜色</label>
                        <input
                          type="color"
                          value={textItem.textColor}
                          onChange={(e) =>
                            handleTextStyleChange(textItem.id, { textColor: e.target.value })
                          }
                          className="w-10 h-10 border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-slate-300 transition-colors flex-shrink-0"
                        />
                      </div>

                      {/* 描边颜色 */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-700 whitespace-nowrap">描边颜色</label>
                        <input
                          type="color"
                          value={textItem.strokeColor}
                          onChange={(e) =>
                            handleTextStyleChange(textItem.id, { strokeColor: e.target.value })
                          }
                          className="w-10 h-10 border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-slate-300 transition-colors flex-shrink-0"
                        />
                      </div>

                      {/* 背景颜色 */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-700 whitespace-nowrap">背景颜色</label>
                        {textItem.backgroundColor ? (
                          <>
                            <div
                              className="w-10 h-10 border border-[#E5E7EB] rounded-lg flex-shrink-0"
                              style={{ backgroundColor: textItem.backgroundColor }}
                            />
                            <button
                              onClick={() =>
                                handleTextStyleChange(textItem.id, { backgroundColor: null })
                              }
                              className="text-xs text-slate-400 hover:text-red-500 transition-colors whitespace-nowrap"
                              title="清除背景颜色"
                            >
                              清除
                            </button>
                          </>
                        ) : (
                          <label className="w-10 h-10 border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-slate-300 transition-colors flex-shrink-0 flex items-center justify-center bg-white relative">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400">
                              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <input
                              type="color"
                              value="#ffffff"
                              onChange={(e) =>
                                handleTextStyleChange(textItem.id, {
                                  backgroundColor: e.target.value,
                                })
                              }
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </label>
                        )}
                      </div>

                      {/* 描边粗细 */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-700 whitespace-nowrap">描边粗细</label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={textItem.strokeWidth}
                          onChange={(e) =>
                            handleTextStyleChange(textItem.id, {
                              strokeWidth: parseInt(e.target.value),
                            })
                          }
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs text-slate-500 w-6 text-right">{textItem.strokeWidth}</span>
                      </div>
                    </div>

                    {/* 添加文字按钮 */}
                    {index === textItems.length - 1 && textItem.text.trim() && (
                      <button
                        onClick={handleAddText}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                      >
                        添加更多文字
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 热梗推荐 - 吸底显示 */}
              <div className="flex-shrink-0 border-t border-[#E5E7EB] pt-4 mt-4 -mx-6 px-6 pb-2 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">热梗推荐</h3>
                  <button
                    onClick={handleRefreshMemePhrases}
                    className="hover:opacity-70 transition-opacity p-1 rounded hover:bg-slate-100"
                    title="刷新"
                  >
                    <img src="/images/Refresh.svg" alt="刷新" className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {memePhrases.map((phrase, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                      onClick={() => handleUseMemePhrase(phrase)}
                    >
                      <span className="text-sm text-slate-700 flex-1">
                        热梗推荐{idx + 1} {phrase}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyMemePhrase(phrase);
                        }}
                        className="text-slate-400 hover:text-blue-500 transition-colors ml-2 p-1 rounded hover:bg-slate-100"
                        title="复制"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 3H11C12.1046 3 13 3.89543 13 5V11C13 12.1046 12.1046 13 11 13H5C3.89543 13 3 12.1046 3 11V5C3 3.89543 3.89543 3 5 3Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M6 1H12C12.5523 1 13 1.44772 13 2V8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧画布区域 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* 顶部工具栏 */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex justify-between items-center flex-shrink-0">
          {/* 左侧：灵感按钮 */}
          <button
            onClick={() => setShowInspiration(true)}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            第一次做没灵感？
          </button>
          
          {/* 右侧：使用指南和导出图片 */}
          <div className="flex items-center gap-6">
            {/* 使用指南按钮 */}
            <div className="relative" ref={guideRef}>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              使用指南
            </button>
            
            {/* 使用指南气泡 */}
            <AnimatePresence>
              {showGuide && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 w-[400px] bg-white rounded-xl shadow-xl border border-[#E5E7EB] p-5 z-50"
                  style={{
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {/* 气泡箭头 */}
                  <div
                    className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-[#E5E7EB] transform rotate-45"
                  />
                  
                  {/* 第一段内容 */}
                  <div className="text-sm leading-relaxed" style={{ color: '#222222' }}>
                    <p>· 添加图片：点击左侧图片</p>
                    <p>· 删除图片：键盘的退格键（Backspace）</p>
                    <p>· 缩放：选中图片后鼠标按住四个角之一拖拽</p>
                    <p>· 旋转：选中图片后鼠标按住旋转图标</p>
                    <p>· 移至顶层：键盘"command+]"</p>
                    <p>· 移至底层：键盘"command+["</p>
                    <p>· 在左侧文字选项下可以添加文字，并对文字颜色、描边颜色、背景颜色和描边粗细进行修改</p>
                  </div>
                  
                  {/* 第二段内容 */}
                  <p className="text-sm mt-4 leading-relaxed" style={{ color: '#999999' }}>
                    速成的简单小工具，如果你有更多想法建议或者发现了bug，欢迎大象私戳@lixinyang26
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={handleExportImage}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
          >
            导出图片
          </button>
          </div>
        </div>
        
        {/* 灵感弹窗 */}
        <AnimatePresence>
          {showInspiration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowInspiration(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-8 max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 关闭按钮 */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowInspiration(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                
                {/* 文案内容 */}
                <div className="text-center mb-8">
                  <p className="text-lg text-slate-700 mb-3">
                    利用这个小工具你可以实现对emoji的自由拼贴和创作，3秒速成属于你自己的表情包！
                  </p>
                  <p className="text-base text-slate-500">
                    给你一些小小的灵感，但可以发挥的创意远不止如此✨
                  </p>
                </div>
                
                {/* 示例图片网格 */}
                <div className="grid grid-cols-6 gap-4">
                  {EXAMPLE_IMAGES.map((src, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-slate-100 hover:scale-105 transition-transform cursor-pointer"
                    >
                      <img
                        src={src}
                        alt={`示例 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 画布 */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto min-h-0 bg-[#F9FAFB]">
          <div
            ref={canvasRef}
            className="relative bg-white border border-[#E5E7EB] rounded-lg"
            style={{
              width: '600px',
              height: '600px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={() => {
              if (!isDragging) {
                setSelectedItemId(null);
              }
            }}
          >
            {canvasItems.map((item) => (
              <CanvasItemComponent key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

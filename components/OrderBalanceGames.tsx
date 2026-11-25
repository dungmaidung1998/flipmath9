"use client";
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./GameMission, ./MathText, ./useGameAudio
 */
import {useEffect,useRef,useState} from 'react';
import GameMission,{useGameMission} from './GameMission';
import MathText from './MathText';
import {useGameAudio} from './useGameAudio';

const bombs=[
  {
    "expression": "48:\\left\\{2\\times\\left[3+\\left(7-4\\right)\\right]\\right\\}",
    "choices": [
      "7-4",
      "3+7",
      "48:2"
    ],
    "answer": 0,
    "hint": "Tính ngoặc trong cùng trước."
  },
  {
    "expression": "5+\\left[18-2\\times\\left(3+4\\right)\\right]",
    "choices": [
      "18-2",
      "3+4"
    ],
    "answer": 1,
    "hint": "Tính trong ngoặc trước, rồi nhân, sau đó trừ."
  },
  {
    "expression": "2\\times\\left\\{15-\\left[8-\\left(6-3\\right)\\right]\\right\\}",
    "choices": [
      "6-3",
      "15-8"
    ],
    "answer": 0,
    "hint": "Gỡ từng lớp ngoặc từ trong ra ngoài."
  },
  {
    "expression": "3^5:3^3+4",
    "choices": [
      "3^3+4",
      "3^5:3^3"
    ],
    "answer": 1,
    "hint": "Chia hai lũy thừa cùng cơ số khác 0: giữ cơ số, trừ các số mũ."
  },
  {
    "expression": "64:\\left(2^5:2^2\\right)",
    "choices": [
      "2^5:2^2",
      "64:2^5"
    ],
    "answer": 0,
    "hint": "Tính thương hai lũy thừa trong ngoặc trước."
  },
  {
    "expression": "6\\times\\left(5^0+3\\right)",
    "choices": [
      "5^0+3",
      "5^0"
    ],
    "answer": 1,
    "hint": "Số khác 0 có lũy thừa mũ 0 bằng 1."
  },
  {
    "expression": "12-\\left[\\left(-3\\right)^0+2\\times4\\right]",
    "choices": [
      "\\left(-3\\right)^0",
      "2\\times4"
    ],
    "answer": 0,
    "hint": "Cơ số âm khác 0 nâng lên mũ 0 cũng bằng 1."
  },
  {
    "expression": "30-\\left\\{2\\times\\left[3^2-\\left(5-2\\right)\\right]\\right\\}",
    "choices": [
      "30-2",
      "5-2"
    ],
    "answer": 1,
    "hint": "Bắt đầu từ ngoặc tròn trong cùng."
  },
  {
    "expression": "\\left[\\left(-2\\right)^3+20\\right]:3",
    "choices": [
      "\\left(-2\\right)^3",
      "20:3"
    ],
    "answer": 0,
    "hint": "Tính lũy thừa của số nguyên âm trước."
  },
  {
    "expression": "40:\\left\\{\\left[2^4:2^2\\right]+6\\right\\}",
    "choices": [
      "2^2+6",
      "2^4:2^2"
    ],
    "answer": 1,
    "hint": "Trong ngoặc vuông, chia lũy thừa cùng cơ số trước."
  }
];
const bombSteps=[
  [
    {
      "choices": [
        "7-4",
        "3+7",
        "2\\times3",
        "48:2"
      ],
      "answer": 0,
      "next": "48:\\left\\{2\\times\\left[3+3\\right]\\right\\}",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "2\\times3",
        "48:2",
        "3+3"
      ],
      "answer": 2,
      "next": "48:\\left\\{2\\times6\\right\\}",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        ""
      ]
    },
    {
      "choices": [
        "2\\times6",
        "48:2"
      ],
      "answer": 0,
      "next": "48:12",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "48:12"
      ],
      "answer": 0,
      "next": "4",
      "feedback": [
        ""
      ]
    }
  ],
  [
    {
      "choices": [
        "5+18",
        "18-2",
        "2\\times3",
        "3+4"
      ],
      "answer": 3,
      "next": "5+\\left[18-2\\times7\\right]",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        ""
      ]
    },
    {
      "choices": [
        "18-2",
        "2\\times7",
        "5+18"
      ],
      "answer": 1,
      "next": "5+\\left[18-14\\right]",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "5+18",
        "18-14"
      ],
      "answer": 1,
      "next": "5+4",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        ""
      ]
    },
    {
      "choices": [
        "5+4"
      ],
      "answer": 0,
      "next": "9",
      "feedback": [
        ""
      ]
    }
  ],
  [
    {
      "choices": [
        "8-6",
        "2\\times15",
        "6-3",
        "15-8"
      ],
      "answer": 2,
      "next": "2\\times\\left\\{15-\\left[8-3\\right]\\right\\}",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "8-3",
        "15-8",
        "2\\times15"
      ],
      "answer": 0,
      "next": "2\\times\\left\\{15-5\\right\\}",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "15-5",
        "2\\times15"
      ],
      "answer": 0,
      "next": "2\\times10",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "2\\times10"
      ],
      "answer": 0,
      "next": "20",
      "feedback": [
        ""
      ]
    }
  ],
  [
    {
      "choices": [
        "3^3+4",
        "3^5:3^3"
      ],
      "answer": 1,
      "next": "3^{2}+4",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        ""
      ]
    },
    {
      "choices": [
        "3^{2}",
        "2+4"
      ],
      "answer": 0,
      "next": "9+4",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "9+4"
      ],
      "answer": 0,
      "next": "13",
      "feedback": [
        ""
      ]
    }
  ],
  [
    {
      "choices": [
        "2^5:2^2",
        "64:2^5"
      ],
      "answer": 0,
      "next": "64:2^{3}",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "64:2",
        "2^{3}"
      ],
      "answer": 1,
      "next": "64:8",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        ""
      ]
    },
    {
      "choices": [
        "64:8"
      ],
      "answer": 0,
      "next": "8",
      "feedback": [
        ""
      ]
    }
  ],
  [
    {
      "choices": [
        "6\\times5",
        "5^0",
        "5^0+3"
      ],
      "answer": 1,
      "next": "6\\times\\left(1+3\\right)",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "1+3",
        "6\\times1"
      ],
      "answer": 0,
      "next": "6\\times4",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "6\\times4"
      ],
      "answer": 0,
      "next": "24",
      "feedback": [
        ""
      ]
    }
  ],
  [
    {
      "choices": [
        "\\left(-3\\right)^0",
        "12-\\left(-3\\right)",
        "2\\times4"
      ],
      "answer": 0,
      "next": "12-\\left[1+2\\times4\\right]",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "12-1",
        "1+2",
        "2\\times4"
      ],
      "answer": 2,
      "next": "12-\\left[1+8\\right]",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        ""
      ]
    },
    {
      "choices": [
        "1+8",
        "12-1"
      ],
      "answer": 0,
      "next": "12-9",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "12-9"
      ],
      "answer": 0,
      "next": "3",
      "feedback": [
        ""
      ]
    }
  ],
  [
    {
      "choices": [
        "30-2",
        "2\\times3^2",
        "5-2"
      ],
      "answer": 2,
      "next": "30-\\left\\{2\\times\\left[3^2-3\\right]\\right\\}",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        ""
      ]
    },
    {
      "choices": [
        "3^2",
        "30-2",
        "2\\times3",
        "3^2-3"
      ],
      "answer": 0,
      "next": "30-\\left\\{2\\times\\left[9-3\\right]\\right\\}",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "9-3",
        "30-2",
        "2\\times9"
      ],
      "answer": 0,
      "next": "30-\\left\\{2\\times6\\right\\}",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "2\\times6",
        "30-2"
      ],
      "answer": 0,
      "next": "30-12",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "30-12"
      ],
      "answer": 0,
      "next": "18",
      "feedback": [
        ""
      ]
    }
  ],
  [
    {
      "choices": [
        "\\left(-2\\right)^3",
        "20:3"
      ],
      "answer": 0,
      "next": "\\left[-8+20\\right]:3",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "20:3",
        "-8+20"
      ],
      "answer": 1,
      "next": "12:3",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        ""
      ]
    },
    {
      "choices": [
        "12:3"
      ],
      "answer": 0,
      "next": "4",
      "feedback": [
        ""
      ]
    }
  ],
  [
    {
      "choices": [
        "2^4:2^2",
        "40:2^4",
        "2^2+6"
      ],
      "answer": 0,
      "next": "40:\\left\\{2^{2}+6\\right\\}",
      "feedback": [
        "",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước."
      ]
    },
    {
      "choices": [
        "40:2^{2}",
        "2+6",
        "2^{2}"
      ],
      "answer": 2,
      "next": "40:\\left\\{4+6\\right\\}",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        ""
      ]
    },
    {
      "choices": [
        "40:4",
        "4+6"
      ],
      "answer": 1,
      "next": "40:10",
      "feedback": [
        "Phép tính này chưa đến lượt hoặc đã bỏ qua ngoặc/số mũ. Em quan sát lại dòng hiện tại và chọn phép tính ưu tiên trước.",
        ""
      ]
    },
    {
      "choices": [
        "40:10"
      ],
      "answer": 0,
      "next": "4",
      "feedback": [
        ""
      ]
    }
  ]
];
// x + a = b. Values are in quarter units to keep every comparison exact.
const balances=[{a:12,b:28},{a:-8,b:20},{a:20,b:8},{a:-12,b:-4},{a:16,b:36},{a:-20,b:8},{a:24,b:-8},{a:-16,b:12},{a:8,b:24},{a:-24,b:-4}];
/**
 * Component React `value`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function value(n:number):string{if(n%4===0)return String(n/4);const d=n%2===0?2:4;return `${n<0?'-':''}\\dfrac{${Math.abs(n)/(4/d)}}{${d}}`;}
const math=(s:string)=><MathText>{`$${s}$`}</MathText>;
/**
 * Component React `OrderBalanceGames`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function OrderBalanceGames({mode}:{mode:'bomb'|'balance'}){
 const mission=useGameMission();
 const audio=useGameAudio();
 const [sound,setSound]=useState(true),[index,setIndex]=useState(0),[solved,setSolved]=useState(false),[message,setMessage]=useState('');
 const [selected,setSelected]=useState<number|null>(null),[,setLeft]=useState<number|null>(null),[,setRight]=useState<number|null>(null);
 const [,setAnswer]=useState('');
 const [bombStep,setBombStep]=useState(0);
 const dragged=useRef<number|null>(null);
 const [balanceChoice,setBalanceChoice]=useState<number|null>(null);
 const [balancePhase,setBalancePhase]=useState<'choose'|'expand'|'simplify'>('choose');
 // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
 const finished=index===10,q=bombs[Math.min(index,9)],eq=balances[Math.min(index,9)];
 // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
 const steps=bombSteps[Math.min(index,9)];
 // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
 const currentStep=steps[Math.min(bombStep,steps.length-1)];
 const choices=currentStep.choices??q.choices;
 const correct=currentStep.answer??q.answer;
 function advance(){setIndex(i=>i+1);setBalanceChoice(null);setBalancePhase('choose');setBombStep(0);setSolved(false);setMessage('');setSelected(null);setLeft(null);setRight(null);setAnswer('');dragged.current=null;}
 useEffect(()=>{if(!mission.autoRun)return;if(!solved)return;const t=setTimeout(advance,2000);return()=>clearTimeout(t);},[mission.autoRun,solved]);
 function restart(){setBalanceChoice(null);setBalancePhase('choose');setIndex(0);setBombStep(0);setSolved(false);setMessage('');setLeft(null);setRight(null);setSelected(null);setAnswer('');dragged.current=null;}
 function cutWire(choice:number){
  if(solved)return;
  setSelected(choice);
  if(choice!==correct){if(sound)audio.effect(false);setMessage(`Chưa đúng. ${currentStep.feedback[choice] || q.hint}`);return;}
  if(sound)audio.effect(true);
  setBombStep(s=>s+1);setSelected(null);
  const complete=bombStep===steps.length-1;
  setSolved(complete);
  setMessage(complete?'✓ Đã tính xong! Bom an toàn.':'✓ Đúng! Kết quả bước này đã hiện bên dưới. Em chọn phép tính tiếp theo.');
 }
 useEffect(()=>{
  if(balancePhase!=='expand'||!mission.canRun)return;
  const timer=setTimeout(()=>{
   setBalancePhase('simplify');
   if(balanceChoice===-eq.a){setSolved(true);setMessage('✓ Vế trái chỉ còn x. Quan sát: số hạng sang vế phải đã đổi dấu; phép tính ở vế phải được giữ nguyên.');}
   else setMessage('Hai vế vẫn cân bằng, nhưng vế trái chưa chỉ còn x. Em thử lại với số đối của số đang cộng với x.');
  },1800);
  return()=>clearTimeout(timer);
 },[balancePhase,balanceChoice,eq.a,mission.canRun]);
 function moveBalance(n:number){
  if(solved||finished||balancePhase!=='choose')return;
  setBalanceChoice(n);setBalancePhase('expand');
  if(sound)audio.effect(n===-eq.a);
  setMessage('Cộng cùng một số vào cả hai vế, rồi rút gọn…');
 }
 const leftExpression=(n:number)=>n===0?'x':`x${n>0?'+':''}${value(n)}`;
 const addition=balanceChoice===null?'':`${balanceChoice>0?'+':''}${value(balanceChoice)}`;
 const shownLeft=balancePhase==='expand'?`${leftExpression(eq.a)}${addition}`:leftExpression(eq.a+(balancePhase==='simplify'?(balanceChoice??0):0));
 const shownRight=balancePhase!=='choose'?`${value(eq.b)}${addition}`:value(eq.b);
 return <GameMission mission={mission} title={mode==='bomb'?'Gỡ bom phép tính':'Giữ cân thăng bằng'} icon={mode==='bomb'?'💣':'⚖️'} intro={mode==='bomb'?'Chọn phép tính cần làm trước, rồi quan sát kết quả ở từng bước.':'Chọn số để cộng vào cả hai vế và quan sát cân rút gọn.'} step={`Câu ${index+1}/10`} finished={finished} ready={solved} onStart={restart} onAdvance={advance}><section className="foundation-game" aria-label={mode==='bomb'?'Gỡ bom phép tính':'Giữ cân thăng bằng'}>
 <div className="game-heading"><div><span className="game-eyebrow">ÔN KIẾN THỨC CŨ · BÀI 4</span><h2>{mode==='bomb'?'💣 Gỡ bom phép tính':'⚖️ Giữ cân thăng bằng'}</h2><p>{mode==='bomb'?'Chọn phép tính cần thực hiện trước. Kết quả tự hiện ở dòng dưới, rồi em chọn phép tính tiếp theo. Không giới hạn thời gian.':'Chọn số cần cộng vào cả hai vế để vế trái chỉ còn x. Quan sát cân trước và sau khi rút gọn.'}</p></div><button type="button" aria-pressed={sound} onClick={()=>setSound(s=>!s)}>{sound?'🔊 Âm thanh bật':'🔇 Âm thanh tắt'}</button></div>
 <div className="game-controls"><strong>{finished?'Hoàn thành':`Câu ${index+1}/10`} · {index+(solved?1:0)}/10 {mode==='bomb'?'bom đã gỡ':'cân đã giải'}</strong><button type="button" onClick={restart}>Chơi lại</button></div>
 <progress className="review-progress" max={10} value={index+(solved?1:0)} aria-label="Tiến độ trò chơi"/>
 {finished?<div className="game-check" role="status"><h3>🎉 {mode==='bomb'?'Đã gỡ an toàn cả 10 quả bom!':'Đã giữ thăng bằng cả 10 chiếc cân!'}</h3><p>{mode==='bomb'?'Nhớ xét dấu ngoặc, lũy thừa, rồi nhân chia và cộng trừ.':'Cộng hoặc trừ cùng một số ở hai vế thì đẳng thức vẫn đúng.'}</p></div>:mode==='bomb'?<>
 <div className={`order-bomb ${solved?'is-safe':''}`}><span aria-hidden="true">{solved?'🛡️':'💣'}</span><div className="bomb-working" aria-live="polite"><div>{math(q.expression)}</div>{steps.slice(0,bombStep).map((s,i)=><div key={i} className={i===bombStep-1?'bomb-latest':''}>{math(`=${s.next}`)}</div>)}</div><strong>{solved?'ĐÃ NGẮT DÂY · AN TOÀN':`Bước ${bombStep+1}/${steps.length}: chọn phép tính ${bombStep===0?'làm trước':'tiếp theo'}`}</strong></div>
 {!solved&&<div className="bomb-wires">{choices.map((c,i)=><button type="button" key={`${bombStep}-${c}`} className={selected===i?'wire-selected':''} onClick={()=>cutWire(i)}><span aria-hidden="true">✂️ ━━━</span><small>Làm phép này trước</small>{math(c)}</button>)}</div>}
 </>:<>
 <p className="balance-equation">{math(`${shownLeft}=${shownRight}`)}</p>
 <div className="balance-beam" aria-hidden="true"><span>⚖️</span></div>
 <div className="balance-pans">
 <div className="balance-pan has-operation"><strong>Vế trái</strong><div>{math(shownLeft)}</div></div>
 <div className="balance-pan has-operation"><strong>Vế phải</strong><div>{math(shownRight)}</div></div>
 </div>
 <div className="balance-tools">{[Math.abs(eq.a),-Math.abs(eq.a)].map(n=><button type="button" key={n} disabled={solved||balancePhase!=='choose'} onClick={()=>moveBalance(n)} aria-label={`Cộng ${n/4} vào cả hai vế`}>{math(`${n>0?'+':''}${value(n)}`)}</button>)}</div>
 {balancePhase==='simplify'&&!solved&&<button type="button" onClick={()=>{setBalanceChoice(null);setBalancePhase('choose');setMessage('');}}>Thử lại từ đẳng thức ban đầu</button>}
 <p className="hint">Chọn một thao tác cho cả hai vế. Cân hiện phép tính đầy đủ, rồi rút gọn vế trái; giữ phép tính ở vế phải để quan sát sự đổi dấu.</p>
 {balancePhase==='simplify'&&<div className="balance-history"><strong>Các bước vừa thực hiện</strong><div>{math(`${leftExpression(eq.a)}=${value(eq.b)}`)}</div><div>{math(`${leftExpression(eq.a)}${addition}=${value(eq.b)}${addition}`)}</div><div>{math(`${shownLeft}=${shownRight}`)}</div></div>}
 </>}
 <div className="game-feedback" role="status">{message}{solved&&mission.autoRun&&<p>{mission.autoRun?'Tự chuyển sau 2 giây…':'Bấm Tiếp theo khi đã sẵn sàng.'}</p>}</div>
 <p className="hint">Trò chơi ôn tập không thay đổi điểm kiểm tra hoặc mức làm chủ.</p>
 </section></GameMission>;
}

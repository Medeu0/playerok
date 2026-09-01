import type {ChecklistItem,KnowledgeItem,ProductData,Progress,QuizQuestion,Scenario,Term} from '../types/content';
export const emptyProgress:Progress={viewed:[],checklist:[],serverChecklist:[],bookmarks:[],wrongAnswers:[],flashcards:{},quizBest:{score:0,total:0},quizLast:{score:0,total:0},lastPage:'home',notes:{}};
export const scoreQuiz=(answers:Record<string,number>,questions:QuizQuestion[])=>({score:questions.filter(q=>answers[q.id]===q.correctOption).length,total:questions.length,percent:questions.length?Math.round(questions.filter(q=>answers[q.id]===q.correctOption).length/questions.length*100):0});
export const percent=(done:number,total:number)=>total?Math.round(done/total*100):0;
export const checklistProgress=(ids:string[],items:ChecklistItem[])=>percent(items.filter(i=>ids.includes(i.id)).length,items.length);
export const readiness=(p:Progress,d:ProductData)=>Math.round((percent(p.viewed.length,d.sections.length+d.rules.length+d.terms.length)+checklistProgress(p.checklist,d.checklist)+(p.quizBest.total?percent(p.quizBest.score,p.quizBest.total):0))/3);
export const filterQuick=<T extends {priority?:string}>(items:T[],minutes:number)=>items.filter(i=>minutes>=30||i.priority==='critical').slice(0,minutes<=5?3:minutes<=15?5:999);
export type SearchResult={id:string;title:string;text:string;page:string;status?:string};
export function searchProduct(d:ProductData,query:string):SearchResult[]{const q=query.trim().toLocaleLowerCase('ru');if(!q)return[];const all:SearchResult[]=[...d.terms.map(x=>({id:x.id,title:x.abbr+' — '+x.name,text:x.body,page:'terms',status:x.status})),...d.sections.map(x=>({id:x.id,title:x.title,text:x.body+' '+(x.bullets||[]).join(' '),page:'army',status:x.status})),...d.rules.map(x=>({id:x.id,title:x.title,text:x.body,page:'rules',status:x.status})),...d.scenarios.map(x=>({id:x.id,title:x.title,text:x.situation,page:'scenarios',status:x.status})),...d.quiz.map(x=>({id:x.id,title:x.question,text:x.explanation,page:'quiz',status:x.status}))];return all.filter(x=>(x.title+' '+x.text).toLocaleLowerCase('ru').includes(q));}
export const shuffle=<T,>(a:T[])=>[...a].sort(()=>Math.random()-.5);
export const serialize=(p:Progress)=>JSON.stringify({version:1,progress:p},null,2);
export function deserialize(raw:string):Progress{const v=JSON.parse(raw);if(v?.version!==1||!v.progress||!Array.isArray(v.progress.checklist))throw new Error('Неподдерживаемый файл прогресса');return {...emptyProgress,...v.progress}}
export type ContentItem=KnowledgeItem|Term|Scenario|QuizQuestion;

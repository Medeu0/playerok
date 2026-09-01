export type SourceStatus='official'|'server_specific'|'training';
export type Priority='critical'|'high'|'normal';
export interface Source{id:string;title:string;url:string;publisher:string;verifiedAt:string;usedBy:string[]}
export interface KnowledgeItem{id:string;title:string;body:string;status:SourceStatus;sourceIds?:string[];priority?:Priority;bullets?:string[];workflow?:string[];whyItMatters?:string;commonMistake?:string}
export interface Term extends KnowledgeItem{abbr:string;name:string;example:string;counterexample:string}
export interface QuizQuestion{id:string;category:string;difficulty:QuizDifficulty;question:string;options:string[];correctOption:number;explanation:string;status:SourceStatus;sourceIds?:string[];priority?:Priority}
export interface Scenario{id:string;title:string;skill:string;situation:string;interviewerMayEvaluate:string;evaluationPoints:string[];weakApproach:string;exampleLogic:string[];status:'training';priority?:Priority}
export interface ChecklistItem{id:string;label:string;priority?:Priority}
export interface ProductData{metadata:{id:string;brand:string;title:string;shortTitle:string;subtitle:string;verifiedAt:string;verifiedLong:string;version:string;disclaimer:string;storageKey:string;labels:{organization:string;organizationLead:string;terms:string};contentMarkers?:{expected:string[];forbidden:string[]}};thresholds:{min:number;label:string}[];sources:Source[];sections:KnowledgeItem[];rules:KnowledgeItem[];terms:Term[];scenarios:Scenario[];quiz:QuizQuestion[];checklist:ChecklistItem[];commonMistakes:KnowledgeItem[];quickPrep:{modes:QuickPrepMode[]};serverSpecific:{intro:string;items:ChecklistItem[];noteFields:{id:string;label:string;multiline?:boolean}[]};faq:{question:string;answer:string}[];changelog:{version:string;date:string;changes:string[]}[]}
export interface Progress{viewed:string[];checklist:string[];serverChecklist:string[];bookmarks:string[];wrongAnswers:string[];flashcards:Record<string,boolean>;quizBest:{score:number;total:number};quizLast:{score:number;total:number};lastPage:string;notes:Record<string,string>}

export type QuizDifficulty='easy'|'medium'|'hard';
export interface QuickPrepStep{label:string;kind:'terms'|'knowledge'|'mistakes'|'quiz'|'reminder'|'mixed'|'scenarios';itemIds?:string[];items?:string[]}
export interface QuickPrepMode{minutes:number;title:string;steps?:QuickPrepStep[];strategy?:'priority'|'all';scenarioCount?:number;quizCount?:number}

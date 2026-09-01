import type {ReactNode} from 'react'; import type {SourceStatus} from '../types/content';
export const Icon=({children}:{children:ReactNode})=><span className="icon" aria-hidden="true">{children}</span>;
export function Badge({status}:{status:SourceStatus}){return <span className={'badge '+status}>{status==='official'?'Официально':status==='server_specific'?'Зависит от сервера':'Тренировка'}</span>}
export function ProgressBar({value,label}:{value:number;label?:string}){return <div className="progress-wrap" aria-label={`${label||'Прогресс'}: ${value}%`}><div className="progress-label"><span>{label||'Прогресс'}</span><b>{value}%</b></div><div className="progress"><i style={{width:`${value}%`}}/></div></div>}
export function Bookmark({id,active,onToggle}:{id:string;active:boolean;onToggle:(id:string)=>void}){return <button className={'bookmark '+(active?'active':'')} onClick={()=>onToggle(id)} aria-label={active?'Удалить из избранного':'Добавить в избранное'}>{active?'★':'☆'}</button>}

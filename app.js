import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs,
  serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig, EXAM_ID } from "./firebase-config.js";

const SECTIONS=[{"name": "Español I", "start": 1, "end": 9, "type": "esp"}, {"name": "Matemáticas I", "start": 10, "end": 30, "type": "mat"}, {"name": "Español II", "start": 31, "end": 47, "type": "esp"}, {"name": "Matemáticas II", "start": 48, "end": 67, "type": "mat"}, {"name": "Español III", "start": 68, "end": 82, "type": "esp"}, {"name": "Matemáticas III", "start": 83, "end": 102, "type": "mat"}, {"name": "Español IV", "start": 103, "end": 111, "type": "esp"}];
const PAGE_FILES=["pages/page_01.jpg", "pages/page_02.jpg", "pages/page_03.jpg", "pages/page_04.jpg", "pages/page_05.jpg", "pages/page_06.jpg", "pages/page_07.jpg", "pages/page_08.jpg", "pages/page_09.jpg", "pages/page_10.jpg", "pages/page_11.jpg", "pages/page_12.jpg", "pages/page_13.jpg", "pages/page_14.jpg", "pages/page_15.jpg", "pages/page_16.jpg", "pages/page_17.jpg", "pages/page_18.jpg", "pages/page_19.jpg", "pages/page_20.jpg", "pages/page_21.jpg", "pages/page_22.jpg", "pages/page_23.jpg", "pages/page_24.jpg", "pages/page_25.jpg", "pages/page_26.jpg", "pages/page_27.jpg", "pages/page_28.jpg", "pages/page_29.jpg", "pages/page_30.jpg", "pages/page_31.jpg", "pages/page_32.jpg", "pages/page_33.jpg", "pages/page_34.jpg", "pages/page_35.jpg"];
const TOTAL_PAGES=35;
const TOTAL=111,LETTERS=['A','B','C','D'],TEACHER_PASS='valenciana2026';
let currentQ=parseInt(localStorage.getItem('cv_current_q')||'1',10);
let currentPage=parseInt(localStorage.getItem('cv_current_page')||'1',10);
let responses=JSON.parse(localStorage.getItem('cv_responses')||'{}');
let key={"1": "B", "2": "C", "3": "C", "4": "D", "5": "B", "6": "A", "7": "B", "8": "D", "9": "B", "10": "A", "11": "A", "12": "A", "13": "D", "14": "B", "15": "C", "16": "A", "17": "C", "18": "C", "19": "B", "20": "C", "21": "B", "22": "B", "23": "D", "24": "A", "25": "A", "26": "D", "27": "D", "28": "B", "29": "D", "30": "B", "31": "D", "32": "B", "33": "A", "34": "A", "35": "D", "36": "B", "37": "B", "38": "D", "39": "C", "40": "A", "41": "C", "42": "D", "43": "B", "44": "C", "45": "D", "46": "A", "47": "A", "48": "B", "49": "A", "50": "A", "51": "D", "52": "C", "53": "A", "54": "B", "55": "C", "56": "A", "57": "C", "58": "A", "59": "C", "60": "A", "61": "D", "62": "C", "63": "D", "64": "A", "65": "C", "66": "C", "67": "B", "68": "D", "69": "B", "70": "A", "71": "D", "72": "B", "73": "C", "74": "A", "75": "D", "76": "D", "77": "A", "78": "D", "79": "C", "80": "B", "81": "D", "82": "A", "83": "B", "84": "B", "85": "B", "86": "D", "87": "A", "88": "C", "89": "C", "90": "B", "91": "B", "92": "C", "93": "A", "94": "D", "95": "B", "96": "C", "97": "A", "98": "C", "99": "D", "100": "C", "101": "C", "102": "C", "103": "D", "104": "D", "105": "C", "106": "D", "107": "B", "108": "B", "109": "C", "110": "B", "111": "C"};
let results=JSON.parse(localStorage.getItem('cv_results')||'[]');
let registrations=JSON.parse(localStorage.getItem('cv_registrations')||'[]');
let student=JSON.parse(localStorage.getItem('cv_current_student')||'null');
let teacherUnlocked=sessionStorage.getItem('cv_teacher_unlocked')==='1';

let firebaseReady=false, app=null, db=null;
try{
  const valid=firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("PEGAR_");
  if(valid){
    app=initializeApp(firebaseConfig);
    db=getFirestore(app);
    firebaseReady=true;
  }
}catch(e){
  console.warn("Firebase no inicializado:", e);
}

function $(id){return document.getElementById(id)}
function norm(s){return String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ')}
function studentKey(names,paternal,maternal){return [norm(names),norm(paternal),norm(maternal)].join('|').replaceAll('/','-')}
function sectionFor(q){return SECTIONS.find(s=>q>=s.start&&q<=s.end)||SECTIONS[0]}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active')}
function save(){localStorage.setItem('cv_responses',JSON.stringify(responses));localStorage.setItem('cv_current_q',String(currentQ));localStorage.setItem('cv_current_page',String(currentPage));updateProgress();saveProgressCloud()}

function updateFirebaseStatus(){
  const el=$('firebaseStatus');
  if(!el) return;
  el.textContent=firebaseReady?'Conectado':'Configuración pendiente o sin conexión';
  el.style.color=firebaseReady?'#188a3a':'#bd1d3a';
}

async function saveProgressCloud(){
  if(!firebaseReady || !student) return;
  try{
    const ref=doc(db,"exams",EXAM_ID,"students",student.studentKey);
    await setDoc(ref,{
      student,
      status:"en_proceso",
      currentQ,
      currentPage,
      responses,
      updatedAt:serverTimestamp()
    },{merge:true});
  }catch(e){console.warn("No se pudo guardar avance en Firebase:",e)}
}

function updateProgress(){
  $('currentQuestionText').textContent='Reactivo '+currentQ+' de '+TOTAL;
  $('progressBar').style.width=Math.round((currentQ-1)/TOTAL*100)+'%';
}

function renderPage(){
  if(currentPage<1) currentPage=1;
  if(currentPage>TOTAL_PAGES) currentPage=TOTAL_PAGES;
  $('pageNumberLabel').textContent='Página '+currentPage+' de '+TOTAL_PAGES;
  $('pageImage').src='pages/page_'+String(currentPage).padStart(2,'0')+'.jpg';
  $('btnPrevPage').disabled=currentPage<=1;
  $('btnNextPage').disabled=currentPage>=TOTAL_PAGES;
  localStorage.setItem('cv_current_page',String(currentPage));
}

function renderQuestion(){
  if(!student) return;
  if(currentQ<1) currentQ=1;
  if(currentQ>TOTAL) currentQ=TOTAL;
  let s=sectionFor(currentQ);
  $('studentDisplay').textContent=student.fullName+' | Tercero';
  $('currentSectionTitle').textContent=s.name+' | Reactivos '+s.start+'-'+s.end;
  $('qBadge').textContent='Reactivo '+currentQ;
  $('sectionBadge').textContent=s.name;
  $('sectionBadge').style.background=s.type==='mat'?'#edfff0':'#e9f4ff';
  $('sectionBadge').style.color=s.type==='mat'?'#11682b':'#0b3b78';

  let opts=$('answerOptions');
  opts.innerHTML='';
  LETTERS.forEach(l=>{
    let label=document.createElement('label');
    label.innerHTML=`<input type="radio" name="currentAnswer" value="${l}"><span class="circle"></span><span>Opción ${l}</span>`;
    let input=label.querySelector('input');
    input.checked=responses[currentQ]===l;
    input.onchange=()=>{responses[currentQ]=l;save()};
    opts.appendChild(label);
  });
  $('btnNextQuestion').classList.toggle('hidden',currentQ===TOTAL);
  $('btnFinish').classList.toggle('hidden',currentQ!==TOTAL);
  renderPage();
  updateProgress();
}

$('btnPrevPage').onclick=()=>{ if(currentPage>1){currentPage--; renderPage(); saveProgressCloud();} };
$('btnNextPage').onclick=()=>{ if(currentPage<TOTAL_PAGES){currentPage++; renderPage(); saveProgressCloud();} };

$('btnStartExam').onclick=async()=>{
  let names=$('studentNames').value.trim();
  let paternal=$('studentPaternal').value.trim();
  let maternal=$('studentMaternal').value.trim();
  let matricula=$('studentId').value.trim();
  $('registerError').textContent='';
  if(!names||!paternal||!maternal){$('registerError').textContent='Captura nombre(s), apellido paterno y apellido materno.';return}
  let keyStudent=studentKey(names,paternal,maternal);

  if(firebaseReady){
    try{
      let ref=doc(db,"exams",EXAM_ID,"students",keyStudent);
      let snap=await getDoc(ref);
      if(snap.exists()){
        $('registerError').textContent='Este estudiante ya fue registrado. No puede volver a ingresar.';
        return;
      }
      student={
        names,paternal,maternal,
        fullName:[names,paternal,maternal].join(' '),
        grade:'Tercero',
        matricula,
        studentKey:keyStudent,
        startTime:new Date().toLocaleString()
      };
      await setDoc(ref,{
        student,
        status:"en_proceso",
        currentQ:1,
        currentPage:1,
        responses:{},
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
    }catch(e){
      console.error(e);
      $('registerError').textContent='No se pudo registrar en Firebase. Revisa la conexión o configuración.';
      return;
    }
  }else{
    if(registrations.includes(keyStudent)){
      $('registerError').textContent='Este estudiante ya fue registrado en este dispositivo. No puede volver a ingresar.';
      return;
    }
    student={
      names,paternal,maternal,
      fullName:[names,paternal,maternal].join(' '),
      grade:'Tercero',
      matricula,
      studentKey:keyStudent,
      startTime:new Date().toLocaleString()
    };
    registrations.push(keyStudent);
    localStorage.setItem('cv_registrations',JSON.stringify(registrations));
  }

  localStorage.setItem('cv_current_student',JSON.stringify(student));
  responses={};
  currentQ=1;
  currentPage=1;
  localStorage.setItem('cv_responses','{}');
  localStorage.setItem('cv_current_q','1');
  localStorage.setItem('cv_current_page','1');
  showScreen('examScreen');
  renderQuestion();
};

$('btnNextQuestion').onclick=()=>{
  if(!responses[currentQ]){alert('Selecciona una respuesta antes de avanzar.');return}
  if(currentQ<TOTAL){currentQ++;save();renderQuestion();window.scrollTo({top:0,behavior:'smooth'})}
};

function scoreRecord(){
  let rec={
    Nombres:student?.names||'',
    'Apellido paterno':student?.paternal||'',
    'Apellido materno':student?.maternal||'',
    'Nombre completo':student?.fullName||'',
    Grado:'Tercero',
    Matricula:student?.matricula||'',
    'Inicio':student?.startTime||'',
    'Finalización':new Date().toLocaleString()
  };
  let total=0;
  SECTIONS.forEach(s=>{
    let ok=0, answered=0;
    for(let q=s.start;q<=s.end;q++){
      if(responses[q]) answered++;
      if(key[q]&&responses[q]===key[q]) ok++;
    }
    rec[s.name]=ok;
    rec[s.name+' respondidas']=answered;
    rec[s.name+' total']=s.end-s.start+1;
    total+=ok;
  });
  rec.Total=total;
  rec['Total reactivos']=TOTAL;
  rec.Porcentaje=Math.round(total/TOTAL*10000)/100;
  for(let q=1;q<=TOTAL;q++) rec['R'+q]=responses[q]||'';
  return rec;
}

function showStudentResults(rec){
  let box=$('studentResults');
  if(!box) return;
  let rows=SECTIONS.map(s=>{
    let ok=rec[s.name]||0;
    let total=rec[s.name+' total']||0;
    let pct=total?Math.round(ok/total*100):0;
    return `<tr><td>${s.name}</td><td>${ok} / ${total}</td><td>${pct}%</td></tr>`;
  }).join('');
  box.innerHTML=`<div class="result-summary"><strong>${rec.Total} / ${rec['Total reactivos']}</strong><span>Porcentaje: ${rec.Porcentaje}%</span></div><table class="result-table"><thead><tr><th>Sección</th><th>Aciertos</th><th>%</th></tr></thead><tbody>${rows}</tbody></table>`;
}

$('btnFinish').onclick=async()=>{
  if(!responses[currentQ]){alert('Selecciona una respuesta antes de finalizar.');return}
  let faltantes=[];
  for(let q=1;q<=TOTAL;q++) if(!responses[q]) faltantes.push(q);
  if(faltantes.length && !confirm('Faltan reactivos por responder: '+faltantes.join(', ')+'. ¿Deseas finalizar de todos modos?')) return;
  let rec=scoreRecord();
  results.push(rec);
  localStorage.setItem('cv_results',JSON.stringify(results));

  if(firebaseReady && student){
    try{
      const ref=doc(db,"exams",EXAM_ID,"students",student.studentKey);
      await setDoc(ref,{
        student,
        status:"finalizado",
        currentQ,
        currentPage,
        responses,
        result:rec,
        finishedAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      },{merge:true});
    }catch(e){alert('El resultado se guardó localmente, pero no pudo enviarse a Firebase.'); console.error(e);}
  }
  localStorage.setItem('cv_finished_'+student.studentKey,'1');
  showStudentResults(rec);
  localStorage.removeItem('cv_current_student');
  showScreen('finishedScreen');
};

function requireTeacher(action){if(teacherUnlocked){action();return}$('loginDialog').showModal();window.pendingTeacherAction=action}
$('btnTeacherLogin').onclick=()=>requireTeacher(()=>$('teacherDialog').showModal());
$('closeLogin').onclick=()=>$('loginDialog').close();
$('loginTeacher').onclick=()=>{
  if($('teacherPassword').value===TEACHER_PASS){
    teacherUnlocked=true;
    sessionStorage.setItem('cv_teacher_unlocked','1');
    $('teacherPassword').value='';
    $('loginDialog').close();
    updateFirebaseStatus();
    if(window.pendingTeacherAction) window.pendingTeacherAction();
    else $('teacherDialog').showModal();
  } else alert('Contraseña incorrecta.');
};

async function loadCloudResults(){
  if(!firebaseReady){alert('Firebase no está configurado.'); return;}
  try{
    let snap=await getDocs(collection(db,"exams",EXAM_ID,"students"));
    let cloud=[];
    snap.forEach(d=>{
      const data=d.data();
      if(data.result) cloud.push(data.result);
    });
    results=cloud;
    localStorage.setItem('cv_results',JSON.stringify(results));
    alert('Resultados actualizados desde Firebase: '+results.length);
  }catch(e){console.error(e); alert('No se pudieron descargar resultados de Firebase.');}
}

function exportExcel(){
  let data=results.length?results:[scoreRecord()];
  if(window.XLSX){
    let wb=XLSX.utils.book_new(), ws=XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb,ws,'Resultados');
    XLSX.writeFile(wb,'Resultados_Examen_Colegio_Valenciana.xlsx');
  } else {
    let headers=Object.keys(data[0]);
    let csv=[headers.join(',')].concat(data.map(r=>headers.map(h=>'"'+String(r[h]??'').replaceAll('"','""')+'"').join(','))).join('\n');
    let a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download='Resultados_Examen_Colegio_Valenciana.csv';
    a.click();
  }
}

function buildKey(){
  let grid=$('answerKeyGrid');
  grid.innerHTML='';
  for(let q=1;q<=TOTAL;q++){
    let d=document.createElement('div');
    d.className='keyItem';
    d.innerHTML=`<b>Reactivo ${q}</b><select data-key="${q}"><option value="">Sin clave</option>${LETTERS.map(l=>`<option value="${l}">${l}</option>`).join('')}</select>`;
    grid.appendChild(d);
    d.querySelector('select').value=key[q]||'';
  }
}

$('btnExport').onclick=()=>requireTeacher(exportExcel);
$('btnDownloadCloud').onclick=()=>requireTeacher(loadCloudResults);
$('btnQr').onclick=()=>requireTeacher(()=>{$('qrUrl').value=location.protocol.startsWith('http')?location.href.split('#')[0]:'';$('qrDialog').showModal()});
$('closeTeacher').onclick=()=>$('teacherDialog').close();
$('saveKey').onclick=()=>{
  document.querySelectorAll('[data-key]').forEach(s=>{if(s.value)key[s.dataset.key]=s.value;else delete key[s.dataset.key]});
  localStorage.setItem('cv_answer_key',JSON.stringify(key));
  alert('Clave guardada localmente. Para cambiar la clave fija del examen, actualiza app.js.');
};
$('clearResults').onclick=()=>{
  if(confirm('¿Borrar resultados y registros locales en este dispositivo?')){
    results=[];
    registrations=[];
    localStorage.setItem('cv_results','[]');
    localStorage.setItem('cv_registrations','[]');
    alert('Resultados y registros locales borrados.');
  }
};
$('logoutTeacher').onclick=()=>{teacherUnlocked=false;sessionStorage.removeItem('cv_teacher_unlocked');$('teacherDialog').close();alert('Acceso docente cerrado.')};

$('closeQr').onclick=()=>$('qrDialog').close();
$('generateQr').onclick=()=>{
  let url=$('qrUrl').value.trim();
  if(!url){alert('Pega primero el enlace público del examen.');return}
  let src='https://api.qrserver.com/v1/create-qr-code/?size=600x600&data='+encodeURIComponent(url);
  $('qrImage').src=src;
  $('downloadQr').href=src;
  $('downloadQr').style.display='inline-block';
};

buildKey();
updateFirebaseStatus();
if(student){showScreen('examScreen');renderQuestion();} else {showScreen('registrationScreen');}

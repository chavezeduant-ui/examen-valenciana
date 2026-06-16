const SECTIONS=[{"name": "Español I", "start": 1, "end": 9, "type": "esp", "page": 3}, {"name": "Matemáticas I", "start": 10, "end": 30, "type": "mat", "page": 5}, {"name": "Español II", "start": 31, "end": 47, "type": "esp", "page": 10}, {"name": "Matemáticas II", "start": 48, "end": 67, "type": "mat", "page": 14}, {"name": "Español III", "start": 68, "end": 82, "type": "esp", "page": 21}, {"name": "Matemáticas III", "start": 83, "end": 102, "type": "mat", "page": 26}, {"name": "Español IV", "start": 103, "end": 111, "type": "esp", "page": 31}];
const Q_PAGE={"1": 3, "2": 3, "3": 3, "4": 3, "5": 3, "6": 3, "7": 3, "8": 3, "9": 3, "10": 5, "11": 5, "12": 6, "13": 6, "14": 6, "15": 6, "16": 6, "17": 6, "18": 6, "19": 7, "20": 7, "21": 7, "22": 7, "23": 7, "24": 8, "25": 8, "26": 8, "27": 8, "28": 8, "29": 9, "30": 9, "31": 10, "32": 10, "33": 10, "34": 10, "35": 10, "36": 10, "37": 10, "38": 11, "39": 11, "40": 11, "41": 12, "42": 12, "43": 12, "44": 12, "45": 13, "46": 13, "47": 13, "48": 14, "49": 14, "50": 14, "51": 15, "52": 15, "53": 15, "54": 15, "55": 15, "56": 16, "57": 16, "58": 17, "59": 17, "60": 17, "61": 17, "62": 18, "63": 18, "64": 18, "65": 18, "66": 19, "67": 20, "68": 22, "69": 22, "70": 22, "71": 22, "72": 22, "73": 22, "74": 23, "75": 23, "76": 23, "77": 24, "78": 24, "79": 24, "80": 25, "81": 25, "82": 25, "83": 26, "84": 26, "85": 26, "86": 26, "87": 27, "88": 27, "89": 27, "90": 27, "91": 28, "92": 28, "93": 29, "94": 29, "95": 29, "96": 29, "97": 30, "98": 30, "99": 30, "100": 30, "101": 30, "102": 30, "103": 31, "104": 31, "105": 31, "106": 31, "107": 32, "108": 32, "109": 32, "110": 32, "111": 32};
const PAGE_FILES=["pages/page_01.jpg", "pages/page_02.jpg", "pages/page_03.jpg", "pages/page_04.jpg", "pages/page_05.jpg", "pages/page_06.jpg", "pages/page_07.jpg", "pages/page_08.jpg", "pages/page_09.jpg", "pages/page_10.jpg", "pages/page_11.jpg", "pages/page_12.jpg", "pages/page_13.jpg", "pages/page_14.jpg", "pages/page_15.jpg", "pages/page_16.jpg", "pages/page_17.jpg", "pages/page_18.jpg", "pages/page_19.jpg", "pages/page_20.jpg", "pages/page_21.jpg", "pages/page_22.jpg", "pages/page_23.jpg", "pages/page_24.jpg", "pages/page_25.jpg", "pages/page_26.jpg", "pages/page_27.jpg", "pages/page_28.jpg", "pages/page_29.jpg", "pages/page_30.jpg", "pages/page_31.jpg", "pages/page_32.jpg", "pages/page_33.jpg", "pages/page_34.jpg", "pages/page_35.jpg"];
const TOTAL=111,LETTERS=['A','B','C','D'],TEACHER_PASS='valenciana2026';
let currentQ=parseInt(localStorage.getItem('cv_current_q')||'1',10);
let responses=JSON.parse(localStorage.getItem('cv_responses')||'{}');
let key=JSON.parse(localStorage.getItem('cv_answer_key')||'{}');
let results=JSON.parse(localStorage.getItem('cv_results')||'[]');
let registrations=JSON.parse(localStorage.getItem('cv_registrations')||'[]');
let student=JSON.parse(localStorage.getItem('cv_current_student')||'null');
let teacherUnlocked=sessionStorage.getItem('cv_teacher_unlocked')==='1';

function $(id){return document.getElementById(id)}
function norm(s){return String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ')}
function studentKey(names,paternal,maternal){return [norm(names),norm(paternal),norm(maternal)].join('|')}
function sectionFor(q){return SECTIONS.find(s=>q>=s.start&&q<=s.end)||SECTIONS[0]}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active')}
function save(){localStorage.setItem('cv_responses',JSON.stringify(responses));localStorage.setItem('cv_current_q',String(currentQ));updateProgress()}

function updateProgress(){
  let answered=Object.values(responses).filter(v=>v).length;
  $('currentQuestionText').textContent='Reactivo '+currentQ+' de '+TOTAL;
  $('progressBar').style.width=Math.round((currentQ-1)/TOTAL*100)+'%';
}

function renderQuestion(){
  if(!student) return;
  if(currentQ<1) currentQ=1;
  if(currentQ>TOTAL) currentQ=TOTAL;

  let s=sectionFor(currentQ);
  let page=Q_PAGE[currentQ] || s.page;
  $('studentDisplay').textContent=student.fullName+' | Tercero';
  $('currentSectionTitle').textContent=s.name+' | Reactivos '+s.start+'-'+s.end;
  $('qBadge').textContent='Reactivo '+currentQ;
  $('sectionBadge').textContent=s.name;
  $('sectionBadge').style.background=s.type==='mat'?'#edfff0':'#e9f4ff';
  $('sectionBadge').style.color=s.type==='mat'?'#11682b':'#0b3b78';
  $('pageNumberLabel').textContent='Página '+page;

  if(PAGE_FILES.length){
    $('pageImage').src='pages/page_'+String(page).padStart(2,'0')+'.jpg';
  } else {
    $('pageImage').alt='No se pudieron generar imágenes del PDF.';
  }

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
  updateProgress();
}

$('btnStartExam').onclick=()=>{
  let names=$('studentNames').value.trim();
  let paternal=$('studentPaternal').value.trim();
  let maternal=$('studentMaternal').value.trim();
  let matricula=$('studentId').value.trim();
  $('registerError').textContent='';
  if(!names||!paternal||!maternal){$('registerError').textContent='Captura nombre(s), apellido paterno y apellido materno.';return}
  let keyStudent=studentKey(names,paternal,maternal);
  if(registrations.includes(keyStudent)){
    $('registerError').textContent='Este estudiante ya fue registrado en este dispositivo. No puede volver a ingresar.';
    return;
  }
  student={
    names:names,
    paternal:paternal,
    maternal:maternal,
    fullName:[names,paternal,maternal].join(' '),
    grade:'Tercero',
    matricula:matricula,
    studentKey:keyStudent,
    startTime:new Date().toLocaleString()
  };
  registrations.push(keyStudent);
  localStorage.setItem('cv_registrations',JSON.stringify(registrations));
  localStorage.setItem('cv_current_student',JSON.stringify(student));
  responses={};
  currentQ=1;
  localStorage.setItem('cv_responses','{}');
  localStorage.setItem('cv_current_q','1');
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

$('btnFinish').onclick=()=>{
  if(!responses[currentQ]){alert('Selecciona una respuesta antes de finalizar.');return}
  let faltantes=[];
  for(let q=1;q<=TOTAL;q++) if(!responses[q]) faltantes.push(q);
  if(faltantes.length && !confirm('Faltan reactivos por responder: '+faltantes.join(', ')+'. ¿Deseas finalizar de todos modos?')) return;
  let rec=scoreRecord();
  results.push(rec);
  localStorage.setItem('cv_results',JSON.stringify(results));
  localStorage.setItem('cv_finished_'+student.studentKey,'1');
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
    if(window.pendingTeacherAction) window.pendingTeacherAction();
    else $('teacherDialog').showModal();
  } else alert('Contraseña incorrecta.');
};

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
$('btnQr').onclick=()=>requireTeacher(()=>{$('qrUrl').value=location.protocol.startsWith('http')?location.href.split('#')[0]:'';$('qrDialog').showModal()});
$('closeTeacher').onclick=()=>$('teacherDialog').close();
$('saveKey').onclick=()=>{
  document.querySelectorAll('[data-key]').forEach(s=>{if(s.value)key[s.dataset.key]=s.value;else delete key[s.dataset.key]});
  localStorage.setItem('cv_answer_key',JSON.stringify(key));
  alert('Clave guardada.');
};
$('clearResults').onclick=()=>{
  if(confirm('¿Borrar resultados y registros guardados en este dispositivo?')){
    results=[];
    registrations=[];
    localStorage.setItem('cv_results','[]');
    localStorage.setItem('cv_registrations','[]');
    alert('Resultados y registros borrados.');
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
if(student){showScreen('examScreen');renderQuestion();} else {showScreen('registrationScreen');}

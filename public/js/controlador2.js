var db;

(()=>{
    if (!('indexedDB' in window)) 
        console.log('Este navegador no soporta indexedDB');
    
        //Si la base de datos no existe la crea, sino solo la abre.
          //Asincrona
          let solicitud = window.indexedDB.open('facebook',2);
        solicitud.onsuccess = function(evento){
            console.log("Se creó o abrió la BD");
            db = solicitud.result;
            llenar();
            llenarUsuarios();
            
        }

        solicitud.onerror = function(evento){
            console.log(evento);
        }

        //Se ejecuta cuando se crea o se necesita actualizar la BD
        solicitud.onupgradeneeded = function(evento){
            //En este punto si se podria crear las colecciones
            console.log('Se creo o actualizó la BD');
            let db = evento.target.result;
            //Las colecciones en IndexedDB se les llama ObjectStores
            let objectStorePost = db.createObjectStore('posts',{keyPath:'id', autoIncrement:true});
            objectStorePost.transaction.oncomplete = function(evento){
                console.log('Se creo el object store de posts');
            }

            objectStorePost.transaction.onerror = function(evento){
                console.log(evento);
            }
        }
        
})();

var entradas = [
    {id:'usuario',valido:false},
    {id:'text',valido:false},
    {id:'fecha',valido:false}
];

function validarEntrada(id){
    let resultado = (document.getElementById(id).value=="")?false:true;
    return resultado;
}

function Entradas(){
    for (let i = 0; i<entradas.length; i++){
    entradas[i].valido = validarEntrada(entradas[i].id);
    }

    for (let i = 0; i<entradas.length; i++){
        if (!entradas[i].valido)
            return;
    }

            let post = {
                usuario: document.getElementById('usuario').value,
                text: document.getElementById('text').value,
                fecha: document.getElementById('fecha').value
            }
            console.log(post);
            return post;
           
}

function postear(){
    let poste = Entradas();
    if (poste==null || poste == undefined){
        return;
    }
    let transaccion = db.transaction(['posts'],'readwrite'); //readonly: Solo lectura, readwrite:lectura y escritura
    let objectStorePost = transaccion.objectStore('posts');
    let solicitud = objectStorePost.add(poste);
    solicitud.onsuccess = function(evento){
        console.log('Se agrego el post con exito');
        console.log(evento);
        llenar();
        
    }

    solicitud.onerror = function(evento){
        console.log(evento);
    }
}
function anexarPost(poster, keyPath){
    document.getElementById('post').innerHTML += 
                `<div class="contenido col-lg-4 col-md-6 col-sm-12 col-xs-12 publicacion">
                    <div style="height: 45px;">
                        <img src="img/login.jpg" alt="" class="foto rounded-circle img-thumbnail">
                        <div class="nombre">
                        ${poster.usuario}
                            </div>
                        <div class="fecha">
                        ${poster.fecha}
                        </div>
                    </div>
                    <hr>
                    <div>
                    ${poster.text}
                    </div>
                </div>`;
}

function llenar(){
    document.getElementById('post').innerHTML =
     `<div class="contenido col-lg-4 col-md-6 col-sm-12 col-xs-12 publicacion">
    <h3>Agregar Post</h3>
        <select id="usuario"  class="form-control"></select>
    <textarea id="text"  class="form-control"></textarea>
    <input type="date"  id="fecha"  class="form-control">
    <button onclick="postear()" type="button" class="btn btn-primary" >Post</button>
    </div>`;
    let transaccion = db.transaction(['posts'],'readonly');
    let objectStorePost = transaccion.objectStore('posts');
    let cursor1 = objectStorePost.openCursor();
    cursor1.onsuccess = function(evento){
        //Se ejecuta por cada registro en el objectstore
        if (evento.target.result){
            console.log(evento.target.result);
            anexarPost(evento.target.result.value, evento.target.result.key);
            evento.target.result.continue(); //Mover el cursor a la siguiente direccion de memoria
        }
    }
}
function llenarUsuarios(){
    document.getElementById('usuario').innerHTML = '';
    let transaccion = db.transaction(['usuarios'],'readonly');
    let objectStoreUsuarios = transaccion.objectStore('usuarios');
    let cursor = objectStoreUsuarios.openCursor();
    console.log(cursor);
    cursor.onsuccess = function(evento){
        //Se ejecuta por cada registro en el objectstore
        if (evento.target.result){
            document.getElementById('usuario').innerHTML += 
            `<option value="${evento.target.result.value.firstName} ${evento.target.result.value.lastName}">${evento.target.result.value.firstName} ${evento.target.result.value.lastName}</option>`;
            evento.target.result.continue(); //Mover el cursor a la siguiente direccion de memoria
        }
    }
    cursor.onerror = function(evento){
        //Se ejecuta por cada registro en el objectstore
        console.log(evento);
    }
}



/* sweet alert */
function sweet(icon, text) {
    Swal.fire({
        icon: icon,
        text: text
    });
}




/* Inicio Login */

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validar campos vacíos
    if (!username || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos vacíos',
            text: 'Por favor, ingrese el nombre de usuario y la contraseña.',
            customClass: {
                container: 'my-swal-container'
            }
        });
        return; // Detener la ejecución si hay campos vacíos
    }

    try {
        const response = await fetch('https://cardelli-backend.vercel.app/api/cardelli/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario: username, password: password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Almacenar el token en localStorage
            localStorage.setItem('authToken', data.token);

            // Mensaje de éxito y redirección
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: 'Redirigiendo...',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false,
                customClass: {
                    container: 'my-swal-container'
                }
            }).then(() => {
                localStorage.setItem('loggedIn', 'true'); // Guardar el estado de la sesión
                window.location.href = 'index-admin.html';
            });
        } else {
            // Manejo de errores de autenticación
            sweet("error",data.error || "Nombre de usuario o contraseña incorrectos");
        }
        
    } catch (error) {
        console.error('Error durante el login:', error);
        sweet("error","Nombre de usuario o contraseña incorrectos");
    }
}

/* HASTA ACA TODO BIEN */
/* ACA CAMBIA EL TOKEN EN EL HEADER */
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Token not found');
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    // Eliminar 'Content-Type' si el body es una instancia de FormData
    if (options.body instanceof FormData) {
        delete options.headers['Content-Type'];
    } else {
        options.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, options);
    let data;
    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }
    return { data, ok: response.ok };
}


/*Productos */
/*GET DE PRODUCTOS*/
async function fetchProductos() {
    try {
        const response = await fetch('http://cardelli-backend.vercel.app/api/cardelli/productos/');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();  // Convertimos la respuesta a JSON
        displayProductos(data);
    } catch (error) {
        console.error('Error fetching productos:', error);
    }
}

/*MOSTRAR LOS PRODUCTOS */
function displayProductos(data) {
    if (!Array.isArray(data)) {
        console.error('Los datos de los productos no son un array:', data);
        return;
    }

    const productosDiv = document.getElementById('productos');

    if (!productosDiv) {
        console.error('No se encontró el elemento #productos en el DOM');
        return;
    }

    // Vaciar el contenedor
    productosDiv.innerHTML = '';

    // Recorrer las categorías y agregarlas al DOM
    data.forEach(categoria => {
        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'category';
        categoriaDiv.id = `category-${categoria.id}`;
        categoriaDiv.innerHTML = `
            <h2>${categoria.nombre}</h2>
            <div class="contenedorBotonesCat">
                <button class="edit" onclick="editCategory(${categoria.id}, '${categoria.nombre}')"><i class="bi bi-pencil-square"></i> Categoria</button>
                <button class="delete" onclick="deleteCategory(${categoria.id})"><i class="bi bi-trash"></i> Categoria</button>
                <button class="add" onclick="addSubcategory(${categoria.id})"><i class="bi bi-plus-circle"></i> Subcategoría</button>
            </div>
        `;

        categoria.subcategorias.forEach(subcategoria => {
            const subcategoriaDiv = document.createElement('div');
            subcategoriaDiv.className = 'subcategory';
            subcategoriaDiv.id = `subcategoria-${subcategoria.id}`;
            subcategoriaDiv.innerHTML = `
                <h3>${subcategoria.nombre}</h3>
                <div class="contenedorBotonesSub">
                    <button class="edit modSub subcategory-btn" onclick="editSubcategory(${categoria.id}, ${subcategoria.id}, '${subcategoria.nombre}')">
                        <i class="bi bi-pencil-square"></i> Subcategoría
                    </button>
                    <button class="delete delSub subcategory-btn" onclick="deleteSubcategory(${categoria.id}, ${subcategoria.id})">
                        <i class="bi bi-trash"></i> Subcategoría
                    </button>
                    <button class="add addProduct subcategory-btn" onclick="addProduct(${subcategoria.id})">
                        <i class="bi bi-plus-circle"></i> Producto
                    </button>
                </div>
            `;

            const productsRowDiv = document.createElement('div');
            productsRowDiv.className = 'products-row';

            subcategoria.productos.forEach(producto => {
                const productContainerDiv = document.createElement('div');
                productContainerDiv.classList.add('product-container');

                const productoDiv = document.createElement('div');
                productoDiv.classList.add('product-index');
                productoDiv.id = `producto-${producto.id}`;

                // Agregar la imagen del producto (si existe)
                const productoImg = document.createElement('img');
                productoImg.src = producto.fotos[0]?.url || '';  // Mostrar la primera foto si existe
                productoImg.alt = producto.nombre;

                // Información del producto
                const productoInfoDiv = document.createElement('div');
                productoInfoDiv.classList.add('product-info');
                productoInfoDiv.innerHTML = `
                    <strong>${producto.nombre}</strong> <br> 
                    <p>${producto.descripcion}</p> 
                    <div class="divPrecio">$${producto.precio}</div>
                `;

                // Medidas del producto
                const medidasDiv = document.createElement('div');
                medidasDiv.classList.add('medidas-info');
                producto.medidas.forEach(medida => {
                    const medidaSpan = document.createElement('span');
                    medidaSpan.classList.add('medida-item');
                    medidaSpan.textContent = medida.nombre;
                    medidasDiv.appendChild(medidaSpan);
                });

                // Botones de acciones del producto
                const productoButtonsDiv = document.createElement('div');
                productoButtonsDiv.classList.add('product-buttons');
                productoButtonsDiv.innerHTML = `
                    <div class="cont-btnProd">
                        <button class="edit modProducto" onclick="editProduct(${producto.id}, '${producto.nombre}', ${producto.precio}, '${producto.descripcion}', '${producto.fotos[0]?.url || ''}')"><i class="bi bi-pencil-square"></i> Editar Producto</button>
                        <button class="delete delProducto" onclick="deleteProduct(${producto.id})"><i class="bi bi-trash"></i> Eliminar Producto</button>
                    </div>
                `;

                productoDiv.appendChild(productoImg);
                productoDiv.appendChild(productoInfoDiv);
                productoDiv.appendChild(medidasDiv);
                productContainerDiv.appendChild(productoDiv);
                productContainerDiv.appendChild(productoButtonsDiv);
                productsRowDiv.appendChild(productContainerDiv);
            });

            subcategoriaDiv.appendChild(productsRowDiv);
            categoriaDiv.appendChild(subcategoriaDiv);
        });

        productosDiv.appendChild(categoriaDiv);
    });
}

window.onload = () => {
    fetchProductos();
    fetchMedidas();
};


/*CATEGORIAS */
/*AGREGAR CATEGORIA */
async function addCategory() {
    const { value: categoryName } = await Swal.fire({
        title: 'Agregar Categoría',
        input: 'text',
        inputLabel: 'Nombre de la categoría',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (categoryName) {
        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/categorias_productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: categoryName })
            });

            if (response.ok) {
                const data = response.data;
                sweet("success", "Categoría creada con éxito.");
                console.log("Respuesta de la API al agregar categoría:", data);
                createCategoryElement(data.id, data.nombre);
            } else {
                Swal.fire('Error', response.data ? response.data.message : 'Hubo un error al crear la categoría', 'error');
            }
        } catch (error) {
            console.error('Error al crear la categoría:', error);
            Swal.fire('Error', 'Hubo un error al crear la categoría', 'error');
        }
    }
}

/* ELIMINAR CATEGORIA */
async function deleteCategory(categoryId) {
    // Mostrar el diálogo de confirmación con SweetAlert
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/categorias_productos/${categoryId}`, {
                    method: 'DELETE'
                });

                sweet("success", "Categoría eliminada con éxito.");
                // Aquí podrías agregar el código para actualizar la UI y remover la categoría eliminada
                const categoryElement = document.getElementById(`category-${categoryId}`);
                if (categoryElement) {
                    categoryElement.remove();
                }
            } catch (error) {
                console.error('Error al eliminar la categoría:', error);
                sweet("error", "Hubo un error al eliminar la categoría.");
            }
        }
    });
}

/*EDITAR CATEGORIA */
async function editCategory(categoryId, currentCategoryName) {
    // Usar SweetAlert2 para pedir el nuevo nombre de la categoría
    const { value: newCategoryName } = await Swal.fire({
        title: 'Modificar Categoría',
        input: 'text',
        inputLabel: 'Nuevo nombre de la categoría',
        inputValue: currentCategoryName,
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (newCategoryName) {
        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/categorias_productos/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: newCategoryName })
            });

            if (response.ok) {
                Swal.fire('Éxito', 'Categoría modificada con éxito.', 'success');

                // Aquí podrías agregar el código para actualizar la UI con el nuevo nombre de la categoría
                const categoryElement = document.querySelector(`#category-${categoryId} h2`);
                if (categoryElement) {
                    categoryElement.textContent = newCategoryName;
                } else {
                    console.error(`No se encontró el elemento con id category-${categoryId}`);
                }

                // También actualizamos el data-category-name del botón de editar
                const editButton = document.querySelector(`#edit-category-${categoryId}`);
                if (editButton) {
                    editButton.dataset.categoryName = newCategoryName;
                }
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'Hubo un error al modificar la categoría', 'error');
            }
        } catch (error) {
            console.error('Error al modificar la categoría:', error);
            Swal.fire('Error', 'Hubo un error al modificar la categoría.', 'error');
        }
    }
}


/* CREAR ELEMENTO CATEGORIA */
function createCategoryElement(categoryId, categoryTitle) {
    const productos = document.getElementById('productos');
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');
    categoryDiv.id = `category-${categoryId}`;

    categoryDiv.innerHTML = `
        <h2>${categoryTitle}</h2>
        <div class="contenedorBotonesCat">
        <button class="edit" onclick="editCategory('${categoryId}')"><i class="bi bi-pencil-square"></i> Editar Categoría</button>
        <button class="delete" onclick="deleteCategory('${categoryId}')"><i class="bi bi-trash"></i> Eliminar Categoría</button>
        <button class="add" onclick="addSubcategory('${categoryId}')"><i class="bi bi-plus-circle"></i>Agregar Subcategoría</button>
        <div id="subcategories-${categoryId}" class="subcategories"></div>
        </div>
    `;

    productos.appendChild(categoryDiv);
}

/* Inicio subcategorias */

async function addSubcategory(categoryId) {
    const { value: subcategoryTitle } = await Swal.fire({
        title: 'Agregar Subcategoría',
        input: 'text',
        inputLabel: 'Nombre de la subcategoría',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (subcategoryTitle) {
        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/subcategorias_productos/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: subcategoryTitle, idCategoriaProducto: categoryId }) // Corrected the key name to idCategoria
            });

            if (response.ok) {
                const data = response.data;
                
                console.log("Respuesta de la API al agregar subcategoría:", data);
                Swal.fire('Éxito', 'Subcategoria creada correctamente.', 'success');
                createSubcategoryElement(categoryId, data.id, data.nombre);
            } else {
                Swal.fire('Error', response.data ? response.data.message : 'Hubo un error al crear la subcategoría', 'error');
            }
        } catch (error) {
            console.error('Error al crear la subcategoría:', error);
            Swal.fire('Error', 'Hubo un error al crear la subcategoría', 'error');
        }
    }
}

async function editSubcategory(categoryId, subcategoryId) {
    const { value: subcategoryTitle } = await Swal.fire({
        title: 'Editar Subcategoría',
        input: 'text',
        inputLabel: 'Nuevo nombre de la subcategoría',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (subcategoryTitle) {
        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/subcategorias_productos/${subcategoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: subcategoryTitle })
            });

            if (response.ok) {
                const subcategoryElement = document.querySelector(`#subcategoria-${subcategoryId} h3`);
                if (subcategoryElement) {
                    subcategoryElement.textContent = subcategoryTitle;
                    Swal.fire('Éxito', 'Subcategoría modificada con éxito.', 'success');
                } else {
                    console.error(`No se encontró el elemento con id subcategoria-${subcategoryId}`);
                }
            } else {
                Swal.fire('Error', response.data ? response.data.message : 'Hubo un error al editar la subcategoría', 'error');
            }
        } catch (error) {
            console.error('Error al editar la subcategoría:', error);
            Swal.fire('Error', 'Hubo un error al editar la subcategoría', 'error');
        }
    }
}

async function deleteSubcategory(categoryId, subcategoryId) {
    // Mostrar el diálogo de confirmación con SweetAlert
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/subcategorias_productos/${subcategoryId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Mostrar mensaje de éxito
                    Swal.fire('Eliminado', 'Subcategoría eliminada con éxito.', 'success');
                    
                    // Eliminar el elemento de la interfaz de usuario
                    const subcategoryElement = document.getElementById(`subcategoria-${subcategoryId}`);
                    if (subcategoryElement) {
                        subcategoryElement.remove();
                    } else {
                        console.error(`No se encontró el elemento con id subcategoria-${subcategoryId}`);
                    }
                } else {
                    // Mostrar mensaje de error
                    Swal.fire('Error', response.data ? response.data.message : 'Hubo un error al eliminar la subcategoría', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar la subcategoría:', error);
                Swal.fire('Error', 'Hubo un error al eliminar la subcategoría', 'error');
            }
        }
    });
}



function createSubcategoryElement(categoryId, subcategoryId, subcategoryName) {
    const categoryElement = document.getElementById(`category-${categoryId}`);

    if (!categoryElement) {
        console.error(`No se encontró el contenedor de subcategorías para la categoría con ID ${categoryId}`);
        Swal.fire('Error', `No se encontró el contenedor de subcategorías para la categoría con ID ${categoryId}`, 'error');
        return;
    }

    const subcategoryDiv = document.createElement('div');
    subcategoryDiv.className = 'subcategory';
    subcategoryDiv.id = `subcategoria-${subcategoryId}`;
    subcategoryDiv.innerHTML = `
    
        <h3>${subcategoryName}</h3>
        <div class="contenedorBotonesSub">
            <button class="edit modSub subcategory-btn" onclick="editSubcategory(${categoryId}, ${subcategoryId}, '${subcategoryName}')"> <i class="bi bi-pencil-square"></i>Subcategoría</button>
            <button class="delete delSub subcategory-btn" onclick="deleteSubcategory(${categoryId}, ${subcategoryId})"><i class="bi bi-trash"></i>Subcategoría</button>
            <button class="add addProduct subcategory-btn" onclick="addProduct(${subcategoryId})"><i class="bi bi-plus-circle"></i>Producto</button>
        </div>
    `;

    const productsRowDiv = document.createElement('div');
    productsRowDiv.className = 'products-row';
    subcategoryDiv.appendChild(productsRowDiv);

    categoryElement.appendChild(subcategoryDiv);

    // Crear enlace para la nueva subcategoría en la barra de búsqueda
    const barraBusquedaDiv = document.getElementById('barra-busqueda');
    if (barraBusquedaDiv) {
        const subcategoriaLink = document.createElement('div');
        subcategoriaLink.className = 'subcategory-link';
        subcategoriaLink.innerHTML = subcategoryName;
        subcategoriaLink.onclick = () => {
            document.getElementById(`subcategoria-${subcategoryId}`).scrollIntoView({ behavior: 'smooth' });
        };
        barraBusquedaDiv.appendChild(subcategoriaLink);
    }
}


/* Inicio crear productos */

async function addProduct(subcategoryId) {
    const { value: formValues } = await Swal.fire({
        title: 'Agregar Producto',
        html: `
            <input id="product-name" class="swal2-input" placeholder="Nombre del producto">
            <input id="product-price" type="number" class="swal2-input" placeholder="Precio del producto">
            <input id="product-description" class="swal2-input" placeholder="Descripción del producto">
            <input id="product-image" type="file" class="swal2-file">
        `,
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('product-name').value;
            const price = document.getElementById('product-price').value;
            const description = document.getElementById('product-description').value;
            const image = document.getElementById('product-image').files[0];
            if (!name || !price || !description || !image) {
                Swal.showValidationMessage('Todos los campos son obligatorios');
                return false;
            }
            return { name, price, description, image };
        }
    });

    if (formValues) {
        const { name, price, description, image } = formValues;
        const formData = new FormData();
        formData.append('data', JSON.stringify({ nombre: name, precio: price, descripcion: description, idSubCategoria: subcategoryId }));
        formData.append('file', image);

        try {
            const { data, ok } = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/productos/upload`, {
                method: 'POST',
                body: formData
            });

            if (ok) {
                createProductElement(subcategoryId, data.id, data.nombre, data.precio, data.descripcion, data.foto);
                Swal.fire('Éxito', 'Producto agregado con éxito.', 'success');
            } else {
                Swal.fire('Error', data.error || 'Hubo un error al agregar el producto', 'error');
            }
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            Swal.fire('Error', 'Hubo un error al agregar el producto', 'error');
        }
    }
}
async function editProduct(productId, currentProductName, currentProductPrice, currentProductDescription, currentProductPhoto) {
    // Usar SweetAlert2 para pedir los nuevos datos del producto
    const { value: formValues } = await Swal.fire({
        title: 'Editar Producto',
        html: `
            <input id="swal-input1" class="swal2-input" placeholder="Nombre" value="${currentProductName || ''}">
            <input id="swal-input2" class="swal2-input" type="number" placeholder="Precio" value="${currentProductPrice || ''}">
            <input id="swal-input3" class="swal2-input" placeholder="Descripción" value="${currentProductDescription || ''}">
            <input id="swal-input4" class="swal2-file" type="file" accept="image/*">
        `,
        focusConfirm: false,
        preConfirm: () => {
            return {
                nombre: document.getElementById('swal-input1').value,
                precio: document.getElementById('swal-input2').value,
                descripcion: document.getElementById('swal-input3').value,
                foto: document.getElementById('swal-input4').files[0]
            };
        },
        showCancelButton: true
    });

    if (formValues) {
        try {
            const formData = new FormData();
            formData.append('data', JSON.stringify({
                nombre: formValues.nombre,
                precio: formValues.precio,
                descripcion: formValues.descripcion
            }));
            if (formValues.foto) {
                formData.append('file', formValues.foto);
            }

            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/productos/${productId}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                Swal.fire('Éxito', 'Producto editado con éxito.', 'success');
                const cartaData = await fetchCarta();
                if (Array.isArray(cartaData)) {
                    displayCarta(cartaData);
                } else {
                    console.error('Los datos de la carta no son un array:', cartaData);
                }
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.error || 'Hubo un error al editar el producto.', 'error');
            }
        } catch (error) {
            console.error('Error al editar el producto:', error);
            Swal.fire('Error', 'Hubo un error al editar el producto.', 'error');
        }
    }
}

async function deleteProduct(productId) {
    // Mostrar el diálogo de confirmación con SweetAlert
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/productos/${productId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    Swal.fire('Éxito', 'Producto eliminado con éxito.', 'success');
                    await fetchCarta(); // Actualizar la carta después de eliminar
                } else {
                    const errorData = await response.json();
                    Swal.fire('Error', errorData.message || 'Hubo un error al eliminar el producto', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar el producto:', error);
                Swal.fire('Error', 'Hubo un error al eliminar el producto', 'error');
            }
        }
    });
}




function createProductElement(subcategoryId, productId, name, price, description, imageUrl) {
    const subcategoryDiv = document.getElementById(`subcategoria-${subcategoryId}`);
    if (subcategoryDiv) {
        const productsRowDiv = subcategoryDiv.querySelector('.products-row');

        // Crear el div contenedor del producto y los botones
        const productContainerDiv = document.createElement('div');
        productContainerDiv.classList.add('product-container');

        // Crear el div del producto
        const productDiv = document.createElement('div');
        productDiv.classList.add('product-index');
        productDiv.id = `product-${productId}`;

        const productImg = document.createElement('img');
        productImg.src = imageUrl;
        productImg.alt = name;

        const productInfoDiv = document.createElement('div');
        productInfoDiv.classList.add('product-info');
        productInfoDiv.innerHTML = `
            <strong>${name}</strong> <br> 
            <p>${description}</p> 
            <div class="divPrecio"> $${price} </div>
        `;

        productDiv.appendChild(productImg);
        productDiv.appendChild(productInfoDiv);

        // Crear el div de los botones
        const productButtonsDiv = document.createElement('div');
        productButtonsDiv.classList.add('product-buttons');
        productButtonsDiv.innerHTML = `
            <div class="cont-btnProd">
                <button class="edit modProducto" onclick="editProduct(${productId}, '${name}', ${price}, '${description}', '${imageUrl}')"><i class="bi bi-pencil-square"></i>Editar Producto</button>
                <button class="delete delProducto" onclick="deleteProduct(${productId})"><i class="bi bi-trash"></i>Eliminar Producto</button>
            </div>
        `;

        // Añadir el producto y los botones al contenedor del producto
        productContainerDiv.appendChild(productDiv);
        productContainerDiv.appendChild(productButtonsDiv);

        // Añadir el contenedor del producto a la fila de productos
        productsRowDiv.appendChild(productContainerDiv);
    } else {
        console.error(`No se encontró el elemento con id subcategoria-${subcategoryId}`);
    }
}

/* Inicio Medidas */

async function fetchMedidas() {
    try {
        const response = await fetch('http://cardelli-backend.vercel.app/api/cardelli/medidas');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }        
        console.log(response);
        
        const data = await response.json();  // Convertimos la respuesta a JSON
        console.log(data);
        displayMedidas(data);  // Llamamos a la función que muestra las medidas
    } catch (error) {
        console.error('Error fetching medidas:', error);
    }
}

/*MOSTRAR LAS MEDIDAS */

function displayMedidas(data) {
    if (!Array.isArray(data)) {
        console.error('Los datos de las medidas no son un array:', data);
        return;
    }

    const medidasDiv = document.getElementById('medidas');  // Contenedor para las medidas

    if (!medidasDiv) {
        console.error('No se encontró el elemento #medidas en el DOM');
        return;
    }

    // Vaciar el contenedor
    medidasDiv.innerHTML = '';

    // Recorrer las medidas y agregarlas al DOM
    data.forEach(medida => {
        const medidaDiv = document.createElement('div');
        medidaDiv.className = 'medida-item';
        medidaDiv.id = `medida-${medida.id}`;
        medidaDiv.innerHTML = `
            <h3>${medida.nombre}</h3>
            <div class="contenedorBotonesMedida">
                <button class="edit" onclick="editMedida(${medida.id}, '${medida.nombre}')"><i class="bi bi-pencil-square"></i> Editar Medida</button>
                <button class="delete" onclick="deleteMedida(${medida.id})"><i class="bi bi-trash"></i> Eliminar Medida</button>
            </div>
        `;
        medidasDiv.appendChild(medidaDiv);
    });
}

// Agregar medida

/* AGREGAR MEDIDA */
async function addMedida() {
    const { value: medidaNombre } = await Swal.fire({
        title: 'Agregar Medida',
        input: 'text',
        inputLabel: 'Nombre de la medida',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (medidaNombre) {
        try {
            const response = await fetchWithAuth('https://cardelli-backend.vercel.app/api/cardelli/medidas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: medidaNombre })
            });

            if (response.ok) {
                console.log(response);
                
                const data = await response.json();
                Swal.fire('Éxito', 'Medida creada con éxito.', 'success');
                console.log("Respuesta de la API al agregar medida:", data);
                createMedidaElement(data.id, data.nombre); // Función para crear el elemento visual
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'Hubo un error al crear la medida', 'error');
            }
        } catch (error) {
            console.error('Error al crear la medida:', error);
            Swal.fire('Error', 'Hubo un error al crear la medida', 'error');
        }
    }
}

/*
function createMedidaElement(medidaId, medidaNombre) {
    const medidasDiv = document.getElementById('medidas');

    if (!medidasDiv) {
        console.error('No se encontró el contenedor #medidas en el DOM');
        Swal.fire('Error', 'No se encontró el contenedor para las medidas', 'error');
        return;
    }

    const medidaDiv = document.createElement('div');
    medidaDiv.className = 'medida-item';
    medidaDiv.id = `medida-${medidaId}`;
    medidaDiv.innerHTML = `
        <h3>${medidaNombre}</h3>
        <div class="contenedorBotonesMedida">
            <button class="edit" onclick="editMedida(${medidaId}, '${medidaNombre}')"><i class="bi bi-pencil-square"></i> Editar Medida</button>
            <button class="delete" onclick="deleteMedida(${medidaId})"><i class="bi bi-trash"></i> Eliminar Medida</button>
        </div>
    `;

    medidasDiv.appendChild(medidaDiv);
}*/


// Editar medida

async function editMedida(medidaId, medidaNombre) {
    const { value: medidaTitle } = await Swal.fire({
        title: 'Editar Medida',
        input: 'text',
        inputLabel: 'Nuevo nombre de la medida',
        inputValue: medidaNombre,  // Mostrar el nombre actual por defecto
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (medidaTitle) {
        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/medidas/${medidaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: medidaTitle })
            });

            if (response.ok) {
                const medidaElement = document.querySelector(`#medida-${medidaId} h3`);
                if (medidaElement) {
                    medidaElement.textContent = medidaTitle;
                    Swal.fire('Éxito', 'Medida modificada con éxito.', 'success');
                } else {
                    console.error(`No se encontró el elemento con id medida-${medidaId}`);
                }
            } else {
                Swal.fire('Error', 'Hubo un error al editar la medida', 'error');
            }
        } catch (error) {
            console.error('Error al editar la medida:', error);
            Swal.fire('Error', 'Hubo un error al editar la medida', 'error');
        }
    }
}

/* ELIMINAR MEDIDA */
async function deleteMedida(medidaId) {
    // Mostrar el diálogo de confirmación con SweetAlert
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/medidas/${medidaId}`, {
                    method: 'DELETE'
                });

                Swal.fire('Eliminada', 'La medida ha sido eliminada con éxito.', 'success');
                
                // Actualizar la UI y remover la medida eliminada
                const medidaElement = document.getElementById(`medida-${medidaId}`);
                if (medidaElement) {
                    medidaElement.remove();
                }
            } catch (error) {
                console.error('Error al eliminar la medida:', error);
                Swal.fire('Error', 'Hubo un error al eliminar la medida.', 'error');
            }
        }
    });
}


/* Inicio Carrusel */

async function fetchCarruselAdmin() {
    try {
        const response = await fetch('https://cardelli-backend.vercel.app/api/cardelli/carrusel/images/urls');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        console.log('Fetched carrusel data:', data);
        displayCarruselAdmin(data);
    } catch (error) {
        console.error('Error fetching the carrusel:', error);
    }
}

function displayCarruselAdmin(data) {                                            // Borro eso pero todavia me falta el token de autorizacion, tengo que esperar el postman
    const carouselInnerAdmin = document.getElementById('carousel-inner-admin'); // En esta borro el -admin y se va el error, el tema es que en ARRE esta y el html esta igual
    carouselInnerAdmin.innerHTML = ""; // Limpia el carrusel

    data.forEach((url, index) => {
        console.log(`Adding image URL: ${url}`);

        const itemDiv = document.createElement('div');
        itemDiv.className = 'carousel-item';
        if (index === 0) {
            itemDiv.classList.add('active'); // Marca el primer ítem como activo
        }

        const img = document.createElement('img');
        img.src = url;
        img.className = 'd-block w-100';

        /*img.onload = () => {
            console.log(`Image loaded: ${url}`);
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
        };*/ 


        itemDiv.appendChild(img);
        carouselInnerAdmin.appendChild(itemDiv);
    });
}

window.addEventListener('load', fetchCarruselAdmin);

async function addImageToCarousel() {
    // Mostrar el diálogo de confirmación con SweetAlert
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Quieres agregar esta imagen al carrusel!",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, agregar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const imageInput = document.getElementById('imageInput');
            const file = imageInput.files[0];

            if (!file) {
                Swal.fire('Error', 'Por favor, selecciona una imagen para agregar.', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const { data, ok } = await fetchWithAuth('https://cardelli-backend.vercel.app/api/cardelli/carrusel/upload', {
                    method: 'POST',
                    body: formData
                });

                if (ok) {
                    const imageUrl = data.url; // Ajusta según la estructura de respuesta del servidor

                    const newCarouselItem = document.createElement('div');
                    newCarouselItem.className = 'carousel-item';
                    const img = document.createElement('img');
                    img.className = 'd-block w-100';
                    img.src = imageUrl;
                    newCarouselItem.appendChild(img);

                    const carouselInner = document.querySelector('.carousel-inner');
                    const activeItem = carouselInner.querySelector('.active');
                    if (activeItem) {
                        activeItem.classList.remove('active');
                    }
                    newCarouselItem.classList.add('active');
                    carouselInner.appendChild(newCarouselItem);

                    Swal.fire('Éxito', 'Imagen agregada al carrusel correctamente.', 'success');
                } else {
                    Swal.fire('Error', 'No se pudo agregar la imagen al carrusel.', 'error');
                }
            } catch (error) {
                console.error('Error al agregar la imagen:', error);
                Swal.fire('Error', 'Hubo un error al agregar la imagen.', 'error');
            }
        }
    });
}

async function deleteImageFromCarousel() {
    // Mostrar el diálogo de confirmación con SweetAlert
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const activeItem = document.querySelector('.carousel-inner .active');
            if (!activeItem) {
                Swal.fire('Error', 'No hay una imagen activa para eliminar.', 'error');
                return;
            }

            const img = activeItem.querySelector('img');
            const imageUrl = img.src;

            console.log('URL de la imagen para eliminar:', imageUrl);

            try {
                const { data, ok } = await fetchWithAuth('https://cardelli-backend.vercel.app/api/cardelli/carrusel/delete/img', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ src: imageUrl })
                });

                if (ok) {
                    Swal.fire('Éxito', 'Imagen eliminada correctamente.', 'success');
                    
                    // Elimina el item del carrusel
                    activeItem.remove();
                    const carouselInner = document.querySelector('.carousel-inner');
                    const items = carouselInner.querySelectorAll('.carousel-item');
                    if (items.length > 0) {
                        if (carouselInner.querySelector('.active') === null) {
                            items[0].classList.add('active');
                        }
                    } else {
                        Swal.fire('Error', 'El carrusel está vacío después de eliminar la imagen.', 'error');
                    }

                    // Volver a cargar la lista actualizada del carrusel
                    await fetchCarruselAdmin();

                } else {
                    Swal.fire('Error', 'No se pudo eliminar la imagen del carrusel.', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar la imagen:', error);
                Swal.fire('Error', 'Hubo un error al eliminar la imagen.', 'error');
            }
        }
    });
}

// Event listeners for buttons
document.getElementById('addImageBtn').addEventListener('click', addImageToCarousel);
document.getElementById('deleteImageBtn').addEventListener('click', deleteImageFromCarousel);


/* Fin Carrusel */

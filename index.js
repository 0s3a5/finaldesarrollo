import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLAVE_SECRETA = process.env.CLAVE_SECRETA || 'sedavueltaelsemestre123';
const AUTH_COOKIE_NAME = 'segurida';
const sql = neon(process.env.DATABASE_URL || 'postgresql://pagina_owner:ACPjs2Bh7ovH@ep-royal-meadow-a5sckxt7.us-east-2.aws.neon.tech/pagina?sslmode=require');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
const authMiddleware = async (req, res, next) => {
  const token = req.cookies[AUTH_COOKIE_NAME];
  try {
    req.user = jwt.verify(token, CLAVE_SECRETA);
    next();
  } catch (e) {
    res.status(401).json({ error: 'No autorizado' });
  }
};



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/homeuser', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'homeuser.html'));
});
app.get('/paginapeluche', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'paginapeluche.html'));
});
app.get('/agregarma', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'agregarma.html'));
});
app.get('/direccionador', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'direccionador.html'));
});

app.get('/direccionadorr', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'direccionadorr.html'));
});
app.get('/editar', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'editar.html'));
});
app.get('/homeADMIN', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'homeADMIN.html'));
});
app.get('/registrarse', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registrarse.html'));
});

app.get('/sesionuser', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'sesionuser.html'));
});

app.get('/wallet', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'wallet.html'));
});
app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'main.html'));
});
app.get('/newcarrito', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'new.carrito.html'));
});

// Endpoint para obtener los datos de un producto por ID
app.get("/api/producto", authMiddleware, async (req, res) => {
  const id = req.query.paginaid;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "ID de producto inválido." });
  }

  try {
    const result = await sql('SELECT * FROM producto WHERE id = $1', [parseInt(id, 10)]);

    if (result.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.json(result[0]); // Enviar los datos del producto en formato JSON
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

app.post("/api/carrito", authMiddleware, async (req, res) => {
  const { id_producto, cantidad } = req.body; // Datos enviados desde el cliente
  const userId = req.user.userId; // ID del usuario autenticado

  // Validación de entrada
  if (!id_producto || isNaN(parseInt(id_producto, 10)) || !cantidad || isNaN(parseInt(cantidad, 10)) || cantidad <= 0) {
      return res.status(400).json({ error: "Datos inválidos. Verifica que id_producto y cantidad sean números válidos." });
  }

  try {
      // Verificar si el producto existe
      const queryProducto = 'SELECT precio, nombre, link_imagen, cantidad FROM producto WHERE id = $1';
      const result = await sql(queryProducto, [parseInt(id_producto, 10)]);

      if (result.length === 0) {
          return res.status(404).json({ error: "Producto no encontrado." });
      }

      const producto = result[0];

      // Validar stock disponible
      if (parseInt(cantidad, 10) > producto.cantidad) {
          return res.status(400).json({ error: "Cantidad solicitada supera el stock disponible." });
      }

      // Calcular el total
      const total = parseInt(producto.precio, 10) * parseInt(cantidad, 10);

      // Insertar en el carrito
      const queryCarrito = `
          INSERT INTO ventaencaja (id_asignado, id_producto, cantidad_producto, total, nombre_producto, imagen_producto) 
          VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await sql(queryCarrito, [
          userId,
          id_producto,
          parseInt(cantidad, 10),
          total,
          producto.nombre,
          producto.link_imagen,
      ]);

      // Actualizar stock en la tabla de productos
      const queryUpdateStock = 'UPDATE producto SET cantidad = cantidad - $1 WHERE id = $2';
      await sql(queryUpdateStock, [parseInt(cantidad, 10), id_producto]);

      res.status(201).json({ message: "Producto agregado al carrito exitosamente." });
  } catch (error) {
      console.error("Error al agregar al carrito:", error);
      res.status(500).json({ error: "Error en el servidor. Por favor, intenta nuevamente." });
  }
});

app.get('/producto/:id', async (req, res) => {
  const { id } = req.params; // Obtener el id del parámetro de la ruta

  try {
      // Realizar la consulta a la base de datos con el nombre correcto de la tabla
        await sql('SELECT id AS id_producto, nombre, precio, cantidad, descripcion, link_imagen FROM producto WHERE id = $1', {id});

      if (result.length > 0) {
          res.json(result[0]); // Si se encuentra, devolver el producto como JSON
      } 
  } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ error: 'Error en el servidor' }); // Manejar errores del servidor
  }
});

app.get('/paginapeluche/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: 'ID inválido' });
  }

  try {
      const query = 'SELECT id AS id_producto, nombre, precio, cantidad, descripcion, link_imagen FROM producto WHERE id = $1';
      const result = await sql(query, [parseInt(id, 10)]);

      if (result.length === 0) {
          return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json(result[0]); // Devolver el producto encontrado
  } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ error: 'Error en el servidor' });
  }
});
app.post('/usuarios', async (req, res) => {
  const { email, password, rango } = req.body;
  const queryCheck = "SELECT * FROM usuarios WHERE email = $1";
  const result = await sql(queryCheck, [email]);
  if (result.length > 0) {
    return res.status(400).json({ error: "El email ya está en uso" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const query = "INSERT INTO usuarios (rango, email, password, dinero) VALUES ($1, $2, $3, $4)";
  await sql(query, [rango, email, hashedPassword, 10000000]);

  res.status(201).json({ message: "Usuario registrado con éxito" });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Intentando iniciar sesión con:', { email, password });

  try {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const results = await sql(query, [email]);

    if (results.length === 0) {
      console.log('No se encontró usuario con ese email.');
      return res.redirect('login.html');
    }

    const user = results[0];
    console.log('Usuario encontrado:', user);

    // Usamos bcrypt.compare para mantener la consistencia con el primer código.
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Coincidencia de contraseñas:', isMatch);

    if (!isMatch) {
      return res.redirect('login.html');
    }

    const token = jwt.sign({ userId: user.id }, CLAVE_SECRETA, { expiresIn: '1h' });

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge: 3600000,
      secure: process.env.NODE_ENV === 'production', // Asegúrate de tener NODE_ENV configurado
      sameSite: 'strict'
    });

    // Responder con el token y el rol (rango)
    return res.status(200).json({
      message: 'Login exitoso',
      token: token,
      rango: user.rango // Enviamos el rol (rango) del usuario
    });

  } catch (err) {
    console.log('Error durante el login:', err);
    return res.redirect('login.html');
  }
});


app.post('/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.status(200).json({ message: 'Logout exitoso' });
});

app.get('/productos', async (req, res) => {
  const productos = await sql("SELECT * FROM producto");
  res.status(200).json(productos);
});


app.post('/carrito', authMiddleware, async (req, res) => {
  const { id_producto, cantidad } = req.body;
  const userId = req.user.id;

  const producto = await sql("SELECT * FROM producto WHERE id = $1", [id_producto]);
  if (producto.length === 0) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const total = producto[0].precio * cantidad;
  await sql(
    "INSERT INTO ventaencaja (id_asignado, id_producto, cantidad_producto, total) VALUES ($1, $2, $3, $4)",
    [userId, id_producto, cantidad, total]
  );

  res.status(201).json({ message: 'Producto agregado al carrito' });
});

app.get('/carrito', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const carrito = await sql("SELECT * FROM ventaencaja WHERE id_asignado = $1", [userId]);
  res.status(200).json(carrito);
});

app.post('/carrito/checkout', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const carrito = await sql("SELECT * FROM ventaencaja WHERE id_asignado = $1", [userId]);

  if (carrito.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  await sql("DELETE FROM ventaencaja WHERE id_asignado = $1", [userId]);
  res.status(200).json({ message: 'Compra finalizada con éxito' });
});

app.post('/usuarios/saldo', authMiddleware, async (req, res) => {
  const { cantidad } = req.body;
  const userId = req.user.id;
  await sql("UPDATE usuarios SET dinero = dinero + $1 WHERE id = $2", [cantidad, userId]);
  res.status(200).json({ message: 'Saldo actualizado con éxito' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor escuchando en http://localhost:${PORT}' );
});
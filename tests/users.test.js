// Bu test dosyası gerçek data/users.json dosyasına KESİNLİKLE dokunmaz.
// "fs" modülü jest.mock("fs") ile sahtelenir; usersController.js dosyayı
// okuyormuş/yazıyormuş gibi davranır ama tüm işlemler bellekte kalır.

jest.mock("fs");

const request = require("supertest");

/**
 * usersController.js, modül ilk yüklendiğinde (dosyanın en üstünde)
 * fs.readFileSync ile "diski" bir kere okur ve sonucu bellekte tutar.
 * Bu yüzden her test grubunun kendi başlangıç verisiyle, önceki testlerden
 * etkilenmeden çalışması için:
 *   1) jest.resetModules() ile modül önbelleğini sıfırlıyoruz,
 *   2) "fs"i yeniden require edip mock dönüş değerini ayarlıyoruz,
 *   3) ardından uygulamayı (index.js) sıfırdan yüklüyoruz.
 * Böylece her çağrı, sanki uygulama o veriyle yeniden başlatılmış gibi
 * davranır — ve hiçbir zaman gerçek diske inmez.
 */
function loadApp(initialUsers) {
  jest.resetModules();
  const freshFs = require("fs");
  freshFs.readFileSync.mockReturnValue(JSON.stringify(initialUsers));
  const app = require("../index");
  return { app, fs: freshFs };
}

const baseUsers = () => [
  { id: 1, isim: "Ahmet", yas: 25 },
  { id: 2, isim: "Mehmet", yas: 30 },
  { id: 3, isim: "Ayşe", yas: 28 },
];

describe("GET /users", () => {
  it("200 durum kodu ve kullanıcı listesini döner", async () => {
    const { app } = loadApp(baseUsers());

    const res = await request(app).get("/users");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(baseUsers());
  });

  it("gerçek data/users.json dosyasına hiç erişmez (fs mock'lu)", async () => {
    const { app, fs: mockedFs } = loadApp(baseUsers());

    await request(app).get("/users");

    expect(mockedFs.readFileSync).toHaveBeenCalled();
    // GET isteği veri değiştirmemeli.
    expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  });
});

describe("GET /users/:id", () => {
  let app;
  beforeEach(() => {
    ({ app } = loadApp(baseUsers()));
  });

  it("var olan id için 200 ve doğru kullanıcıyı döner", async () => {
    const res = await request(app).get("/users/2");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 2, isim: "Mehmet", yas: 30 });
  });

  it("geçerli formatta ama var olmayan id için 404 döner", async () => {
    const res = await request(app).get("/users/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ hata: "Kullanıcı bulunamadı" });
  });

  it("negatif id için 400 döner", async () => {
    const res = await request(app).get("/users/-1");
    expect(res.status).toBe(400);
    expect(res.body.hatalar).toBeDefined();
  });

  it("sayısal olmayan id için 400 döner", async () => {
    const res = await request(app).get("/users/abc");
    expect(res.status).toBe(400);
    expect(res.body.hatalar).toBeDefined();
  });
});

describe("POST /users", () => {
  let app;
  beforeEach(() => {
    ({ app } = loadApp(baseUsers()));
  });

  it("geçerli veriyle 201 döner ve en büyük id + 1 ile yeni kullanıcı oluşturur", async () => {
    const res = await request(app).post("/users").send({ isim: "Fatma", yas: 22 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 4, isim: "Fatma", yas: 22 });
  });

  it("boş kullanıcı listesinde ilk kullanıcıya id=1 atanır", async () => {
    const { app: emptyApp } = loadApp([]);

    const res = await request(emptyApp).post("/users").send({ isim: "İlk Kullanıcı", yas: 20 });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
  });

  it("isim eksikse 400 döner", async () => {
    const res = await request(app).post("/users").send({ yas: 22 });
    expect(res.status).toBe(400);
    expect(res.body.hatalar).toBeDefined();
  });

  it("yas eksikse 400 döner", async () => {
    const res = await request(app).post("/users").send({ isim: "Fatma" });
    expect(res.status).toBe(400);
  });

  it("isim 2 karakterden kısaysa 400 döner", async () => {
    const res = await request(app).post("/users").send({ isim: "A", yas: 22 });
    expect(res.status).toBe(400);
  });

  it("yas 1'den küçükse 400 döner", async () => {
    const res = await request(app).post("/users").send({ isim: "Fatma", yas: 0 });
    expect(res.status).toBe(400);
  });

  it("yas 120'den büyükse 400 döner", async () => {
    const res = await request(app).post("/users").send({ isim: "Fatma", yas: 121 });
    expect(res.status).toBe(400);
  });

  it("başarılı oluşturmada dosyaya kaydetme (fs.writeFileSync) tetiklenir", async () => {
    const { app: a, fs: mockedFs } = loadApp(baseUsers());

    await request(a).post("/users").send({ isim: "Fatma", yas: 22 });

    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
  });
});

describe("PUT /users/:id", () => {
  let app;
  beforeEach(() => {
    ({ app } = loadApp(baseUsers()));
  });

  it("var olan kullanıcıyı tamamen günceller -> 200", async () => {
    const res = await request(app).put("/users/2").send({ isim: "Mehmet Güncel", yas: 31 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 2, isim: "Mehmet Güncel", yas: 31 });
  });

  it("geçerli formatta ama var olmayan id için 404 döner", async () => {
    const res = await request(app).put("/users/999").send({ isim: "Yok", yas: 40 });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ hata: "Kullanıcı bulunamadı" });
  });

  it("geçersiz id formatı için 400 döner", async () => {
    const res = await request(app).put("/users/abc").send({ isim: "X", yas: 20 });
    expect(res.status).toBe(400);
  });

  it("isim eksikse 400 döner", async () => {
    const res = await request(app).put("/users/2").send({ yas: 31 });
    expect(res.status).toBe(400);
  });

  it("yas eksikse 400 döner", async () => {
    const res = await request(app).put("/users/2").send({ isim: "Mehmet" });
    expect(res.status).toBe(400);
  });

  it("başarılı güncellemede dosyaya kaydetme tetiklenir", async () => {
    const { app: a, fs: mockedFs } = loadApp(baseUsers());

    await request(a).put("/users/2").send({ isim: "Mehmet Güncel", yas: 31 });

    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
  });
});

describe("PATCH /users/:id", () => {
  let app;
  beforeEach(() => {
    ({ app } = loadApp(baseUsers()));
  });

  it("sadece isim gönderilirse kısmi günceller -> 200", async () => {
    const res = await request(app).patch("/users/1").send({ isim: "Ahmet Güncel" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, isim: "Ahmet Güncel", yas: 25 });
  });

  it("sadece yas gönderilirse kısmi günceller -> 200", async () => {
    const res = await request(app).patch("/users/1").send({ yas: 26 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, isim: "Ahmet", yas: 26 });
  });

  it("hiçbir alan gönderilmezse 400 döner", async () => {
    const res = await request(app).patch("/users/1").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ hata: "Güncellenecek en az bir alan gönderilmelidir" });
  });

  it("geçerli formatta ama var olmayan id için 404 döner", async () => {
    const res = await request(app).patch("/users/999").send({ isim: "Yok" });
    expect(res.status).toBe(404);
  });

  it("geçersiz id formatı için 400 döner", async () => {
    const res = await request(app).patch("/users/abc").send({ isim: "X" });
    expect(res.status).toBe(400);
  });

  it("isim 2 karakterden kısaysa 400 döner", async () => {
    const res = await request(app).patch("/users/1").send({ isim: "A" });
    expect(res.status).toBe(400);
  });

  it("yas 120'den büyükse 400 döner", async () => {
    const res = await request(app).patch("/users/1").send({ yas: 200 });
    expect(res.status).toBe(400);
  });

  it("başarılı kısmi güncellemede dosyaya kaydetme tetiklenir", async () => {
    const { app: a, fs: mockedFs } = loadApp(baseUsers());

    await request(a).patch("/users/1").send({ yas: 26 });

    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
  });
});

describe("DELETE /users/:id", () => {
  let app;
  beforeEach(() => {
    ({ app } = loadApp(baseUsers()));
  });

  it("var olan kullanıcıyı siler -> 200 ve silinen kullanıcıyı döner", async () => {
    const res = await request(app).delete("/users/2");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      mesaj: "Kullanıcı silindi",
      kullanici: { id: 2, isim: "Mehmet", yas: 30 },
    });
  });

  it("silme sonrası kullanıcı listede kalmaz", async () => {
    await request(app).delete("/users/2");

    const res = await request(app).get("/users");

    expect(res.body).toHaveLength(2);
    expect(res.body.find((u) => u.id === 2)).toBeUndefined();
  });

  it("geçerli formatta ama var olmayan id için 404 döner", async () => {
    const res = await request(app).delete("/users/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ hata: "Kullanıcı bulunamadı" });
  });

  it("geçersiz id formatı için 400 döner", async () => {
    const res = await request(app).delete("/users/abc");
    expect(res.status).toBe(400);
  });

  it("başarılı silmede dosyaya kaydetme tetiklenir", async () => {
    const { app: a, fs: mockedFs } = loadApp(baseUsers());

    await request(a).delete("/users/2");

    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
  });
});

describe("Veri kalıcılığı: JSON dosyasına kayıt ve uygulama yeniden yüklendiğinde korunma", () => {
  it("POST sonrası writeFileSync'e yazılan içerik yeni kullanıcıyı da kapsar", async () => {
    const { app, fs: mockedFs } = loadApp(baseUsers());

    const res = await request(app).post("/users").send({ isim: "Kalıcı Kullanıcı", yas: 40 });
    expect(res.status).toBe(201);

    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);

    // writeFileSync(path, içerik) çağrısının ikinci argümanı: diske "yazılan" JSON metni.
    const writtenContent = mockedFs.writeFileSync.mock.calls[0][1];
    const writtenUsers = JSON.parse(writtenContent);

    expect(writtenUsers).toEqual([...baseUsers(), { id: 4, isim: "Kalıcı Kullanıcı", yas: 40 }]);
  });

  it("uygulama yeniden yüklendiğinde (sunucu restart simülasyonu) önceden kaydedilen veriyi okur", async () => {
    // 1. aşama: "ilk çalışma" - bir kullanıcı ekleyip kaydediyoruz.
    const first = loadApp(baseUsers());
    const createRes = await request(first.app)
      .post("/users")
      .send({ isim: "Kalıcı Kullanıcı", yas: 45 });
    expect(createRes.status).toBe(201);

    const savedContent = first.fs.writeFileSync.mock.calls[0][1];
    const savedUsers = JSON.parse(savedContent);

    // 2. aşama: "sunucu yeniden başlıyor" - modül önbelleği sıfırlanır ve
    // fs.readFileSync bu kez 1. aşamada "diske yazılan" içeriği döndürür.
    // Gerçek dosyaya hiç dokunulmaz; tamamen bellekte simüle edilir.
    const second = loadApp(savedUsers);

    const getRes = await request(second.app).get("/users");

    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(savedUsers);
    expect(getRes.body.find((u) => u.isim === "Kalıcı Kullanıcı")).toBeDefined();
  });
});

const users = [
  { id: 1, isim: "Ahmet", yas: 25 },
  { id: 2, isim: "Mehmet", yas: 30 },
  { id: 3, isim: "Ayşe", yas: 28 }
];

const getAllUsers = (req, res) => {
  res.json(users);
};

const getUserById = (req, res) => {
  const id = Number(req.params.id);

  const user = users.find(
    (kullanici) => kullanici.id === id
  );

  if (!user) {
    return res.status(404).json({
      hata: "Kullanıcı bulunamadı"
    });
  }

  res.json(user);
};

const createUser = (req, res) => {
  const { isim, yas } = req.body;

  if (!isim || yas === undefined) {
    return res.status(400).json({
      hata: "İsim ve yaş zorunludur"
    });
  }

  const yeniKullanici = {
    id: users.length + 1,
    isim: isim,
    yas: Number(yas)
  };

  users.push(yeniKullanici);

  res.status(201).json(yeniKullanici);
};

const updateUser = (req, res) => {
  const id = Number(req.params.id);
  const { isim, yas } = req.body;

  const user = users.find(
    (kullanici) => kullanici.id === id
  );

  if (!user) {
    return res.status(404).json({
      hata: "Kullanıcı bulunamadı"
    });
  }

  if (!isim || yas === undefined) {
    return res.status(400).json({
      hata: "İsim ve yaş zorunludur"
    });
  }

  user.isim = isim;
  user.yas = Number(yas);

  res.json(user);
};

const patchUser = (req, res) => {
  const id = Number(req.params.id);
  const { isim, yas } = req.body;

  const user = users.find(
    (kullanici) => kullanici.id === id
  );

  if (!user) {
    return res.status(404).json({
      hata: "Kullanıcı bulunamadı"
    });
  }

  if (isim === undefined && yas === undefined) {
    return res.status(400).json({
      hata: "Güncellenecek en az bir alan gönderilmelidir"
    });
  }

  if (isim !== undefined) {
    user.isim = isim;
  }

  if (yas !== undefined) {
    user.yas = Number(yas);
  }

  res.json(user);
};

const deleteUser = (req, res) => {
  const id = Number(req.params.id);

  const userIndex = users.findIndex(
    (kullanici) => kullanici.id === id
  );

  if (userIndex === -1) {
    return res.status(404).json({
      hata: "Kullanıcı bulunamadı"
    });
  }

  const silinenKullanici = users.splice(userIndex, 1);

  res.json({
    mesaj: "Kullanıcı silindi",
    kullanici: silinenKullanici[0]
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser
};

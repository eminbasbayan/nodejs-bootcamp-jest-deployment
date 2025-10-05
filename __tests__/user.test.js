const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/userRoutes');
const User = require('../models/User');
require('./setup');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User API Tests', () => {

  describe('POST /api/users - Kullanıcı Oluşturma', () => {
    test('Geçerli verilerle yeni kullanıcı oluşturulmalı', async () => {
      const userData = {
        name: 'Emin Başbayan',
        email: 'emin@example.com',
        age: 25
      };

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.age).toBe(userData.age);
    });

    test('Email olmadan kullanıcı oluşturulamamalı', async () => {
      const userData = {
        name: 'Test User',
        age: 30
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('hata');
    });

    test('İsim olmadan kullanıcı oluşturulamamalı', async () => {
      const userData = {
        email: 'test@example.com',
        age: 30
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('Negatif yaş değeri kabul edilmemeli', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        age: -5
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users - Tüm Kullanıcıları Listeleme', () => {
    test('Tüm kullanıcılar listelenebilmeli', async () => {
      // Önce test verileri oluştur
      await User.create([
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 },
        { name: 'User 3', email: 'user3@example.com', age: 35 }
      ]);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.data).toHaveLength(3);
    });

    test('Hiç kullanıcı yoksa boş liste dönmeli', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/users/:id - Tek Kullanıcı Getirme', () => {
    test('Geçerli ID ile kullanıcı getirilebilmeli', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        age: 25
      });

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(user._id.toString());
      expect(response.body.data.name).toBe(user.name);
    });

    test('Geçersiz ID ile 500 hatası dönmeli', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test('Olmayan ID ile 404 hatası dönmeli', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('bulunamadı');
    });
  });

  describe('PUT /api/users/:id - Kullanıcı Güncelleme', () => {
    test('Kullanıcı bilgileri güncellenebilmeli', async () => {
      const user = await User.create({
        name: 'Old Name',
        email: 'old@example.com',
        age: 25
      });

      const updateData = {
        name: 'New Name',
        age: 30
      };

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.age).toBe(updateData.age);
      expect(response.body.data.email).toBe(user.email); // Email değişmemeli
    });

    test('Olmayan kullanıcı güncellenemez - 404 dönmeli', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('Geçersiz veri ile güncelleme yapılamamalı', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        age: 25
      });

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .send({ age: -10 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id - Kullanıcı Silme', () => {
    test('Kullanıcı silinebilmeli', async () => {
      const user = await User.create({
        name: 'User to Delete',
        email: 'delete@example.com',
        age: 25
      });

      const response = await request(app)
        .delete(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('silindi');

      // Kullanıcının gerçekten silindiğini kontrol et
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    test('Olmayan kullanıcı silinemez - 404 dönmeli', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('bulunamadı');
    });

    test('Geçersiz ID ile silme işlemi hata vermeli', async () => {
      const response = await request(app)
        .delete('/api/users/invalid-id')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Email Validasyonu', () => {
    test('Email küçük harfe çevrilmeli', async () => {
      const userData = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        age: 25
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.data.email).toBe('test@example.com');
    });

    test('Aynı email ile iki kullanıcı oluşturulamamalı', async () => {
      const userData = {
        name: 'User 1',
        email: 'duplicate@example.com',
        age: 25
      };

      // İlk kullanıcı oluşturulsun
      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Aynı email ile ikinci kullanıcı oluşturulmaya çalışılsın
      const response = await request(app)
        .post('/api/users')
        .send({ ...userData, name: 'User 2' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
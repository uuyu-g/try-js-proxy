interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

type CRUD<T> = {
  create: (data: Partial<T>) => Promise<T>;
  get: (id: number) => Promise<T>;
  getAll: () => Promise<T[]>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  delete: (id: number) => Promise<void>;
};

type RestClient = {
  posts: {
    getAll: () => Promise<Post[]>;
    create: (post: Partial<Post>) => Promise<Post>;
    get: (id: number) => Promise<Post>;
    update: (id: number, post: Partial<Post>) => Promise<Post>;
    delete: (id: number) => Promise<void>;
  };
  users: {
    getAll: () => Promise<User[]>;
    create: (user: Partial<User>) => Promise<User>;
    get: (id: number) => Promise<User>;
    update: (id: number, user: Partial<User>) => Promise<User>;
    delete: (id: number) => Promise<void>;
  };
};

const baseUrl = 'https://jsonplaceholder.typicode.com';

const restClient: RestClient = new Proxy({} as RestClient, {
  get: function (target, prop, receiver) {
    return {
      getAll: async () => {
        const url = `${baseUrl}/${String(prop)}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      },
      create: async (data) => {
        const url = `${baseUrl}/${String(prop)}`;
        const response = await fetch(url, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      },
      get: async (id) => {
        const url = `${baseUrl}/${String(prop)}/${id}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      },
      update: async (id, data) => {
        const url = `${baseUrl}/${String(prop)}/${id}`;
        const response = await fetch(url, {
          method: 'PUT',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      },
      delete: async (id) => {
        const url = `${baseUrl}/${String(prop)}/${id}`;
        const response = await fetch(url, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      },
    } as CRUD<any>;
  },
});

// 使用例
(async () => {
  try {
    const newUser = await restClient.users.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
    });
    console.log(newUser);

    const newPost = await restClient.posts.create({
      userId: newUser.id,
      title: 'New Post',
      body: 'This is a new post',
    });
    console.log(newPost);

    const updatedPost = await restClient.posts.update(newPost.id, { title: 'Updated Post' });
    console.log(updatedPost);

    const fetchedUser = await restClient.users.get(newUser.id);
    console.log(fetchedUser);

    const fetchedPost = await restClient.posts.get(newPost.id);
    console.log(fetchedPost);

    await restClient.users.delete(newUser.id);
    console.log('User deleted');

    await restClient.posts.delete(newPost.id);
    console.log('Post deleted');
  } catch (error) {
    console.error(error);
  }
})();

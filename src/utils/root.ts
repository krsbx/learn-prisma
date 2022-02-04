import cors from 'cors';
import express, { Express } from 'express';
const { FQP } = require('filter-query-parser');
import repository from '../repository';

export default (app: Express) => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('public'));

  app.get('/users', async (req: any, res: any) => {
    req.filterQueryParams = req.query.filters
      ? FQP.parser(req.query.filters)
      : {};
    const users = await repository.users.findAll(
      {},
      req.filterQueryParams
      // req.query
    );

    return res.json(users);
  });

  app.get('/users/:id', async (req: any, res: any) => {
    const user = await repository.users.findOne(req.params.id);

    return res.json(user);
  });
};

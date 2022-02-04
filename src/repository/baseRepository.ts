import { Prisma, PrismaClient } from '@prisma/client';
import _ from 'lodash';
import moment from 'moment';

const prisma = new PrismaClient();
type PrismaType = typeof prisma;

type Model = keyof Omit<
  PrismaType,
  | '$on'
  | '$connect'
  | '$disconnect'
  | '$use'
  | '$executeRaw'
  | '$executeRawUnsafe'
  | '$queryRaw'
  | '$queryRawUnsafe'
  | '$transaction'
>;

export const findAll =
  (model: Model = 'user') =>
  (conditions: any, filterQueryParams: any = {}, options: any = {}) => {
    const limit = +(options.limit === 'all' ? 0 : _.get(options, 'limit', 10));
    const offset =
      options.page && options.page > 0 ? limit * (options.page - 1) : 0;
    const otherOptions = _.omit(options, ['limit', 'offset']);

    // translate filterQueryParams to sequelize conditions
    // only works for AND condition for now
    const rules: any = {};
    _.forEach(filterQueryParams.rules, ({ field, operator, value }: any) => {
      let operations = null;
      let sequelizeValue = value;

      switch (operator) {
        case '=':
          operations = 'equals';
          break;
        case '>':
          operations = 'gt';
          break;
        case '<':
          operations = 'lt';
          break;
        case '>=':
          operations = 'gte';
          break;
        case '<=':
          operations = 'lte';
          break;
        case '&':
          operations = 'AND';
          break;
        case 'OR':
          operations = 'OR';
          break;
        case 'IN':
          operations = 'in';
          break;
        case 'NOT':
          operations = 'not';
          break;
        case 'CONTAINS':
          operations = 'contains';
          break;
        default:
          operations = operator;
      }

      // Need to wrap the value with DATE() function if want to compare date using YYYY-MM-DD format
      rules[field] = { [operations]: sequelizeValue };
    });

    const where = { ...conditions, rules, ...otherOptions };

    return prisma[model].findMany({
      where,
      skip: offset,
      take: limit,
    });
  };

export const createRow = (model: Model) => (data: any) =>
  prisma[model].create({
    data,
  });

export const updateRow =
  (model: Model) => (conditions: object | string, data: any) => {
    const dbCond = _.isObject(conditions) ? conditions : { id: conditions };
    const dbData = _.isObject(data) ? data : { data };

    return prisma[model].update({ data: dbData, where: dbCond });
  };

export const deleteRow = (model: Model) => (conditions: object | string) => {
  const dbCond = _.isObject(conditions) ? conditions : { id: conditions };

  return prisma[model].delete({ where: dbCond });
};

export const findOne = (model: Model) => (conditions: object | string) => {
  const dbCond = _.isObject(conditions) ? conditions : { id: conditions };

  return prisma[model].findFirst({ where: dbCond });
};

export const modelToResource = async (model: Model) => model;

export const resourceToModel = async (resource: Model) => resource;

export const factory = (model: Model) => ({
  findAll: findAll(model),
  findOne: findOne(model),
  create: createRow(model),
  update: updateRow(model),
  delete: deleteRow(model),
  modelToResource: modelToResource,
  resourceToModel: resourceToModel,
});

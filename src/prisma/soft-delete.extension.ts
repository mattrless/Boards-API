import { Prisma } from '../../generated/prisma/client';

const SOFT_DELETE_MODELS = ['User', 'Board'] as const;
type SoftDeleteModel = (typeof SOFT_DELETE_MODELS)[number];

function isSoftDeleteModel(model: string): model is SoftDeleteModel {
  return SOFT_DELETE_MODELS.includes(model as SoftDeleteModel);
}

type AnyArgs = {
  where?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

export const softDeleteExtension = Prisma.defineExtension({
  name: 'soft-delete',

  query: {
    $allModels: {
      findMany({ model, args, query }) {
        if (!isSoftDeleteModel(model)) return query(args);

        const typedArgs = args as AnyArgs;
        typedArgs.where ??= {};

        if (typedArgs.where.deletedAt === undefined) {
          typedArgs.where.deletedAt = null;
        }

        return query(typedArgs);
      },

      findFirst({ model, args, query }) {
        if (!isSoftDeleteModel(model)) return query(args);

        const typedArgs = args as AnyArgs;
        typedArgs.where ??= {};

        if (typedArgs.where.deletedAt === undefined) {
          typedArgs.where.deletedAt = null;
        }

        return query(typedArgs);
      },
    },
  },
});

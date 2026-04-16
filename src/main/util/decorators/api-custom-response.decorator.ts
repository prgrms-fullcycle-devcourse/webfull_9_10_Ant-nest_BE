import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { applyDecorators, Type } from "@nestjs/common";
import CustomResponse from "../../common/response/custom-response";

export const ApiCustomResponseDecorator = <TModel extends Type<any>>(
  model?: TModel | null,
  status: number = 200,
) => {
  const extraModels: any[] = [CustomResponse];

  if (model) {
    extraModels.push(model);
  }

  return applyDecorators(
    ApiExtraModels(...extraModels),
    ApiResponse({
      status: status,
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(CustomResponse),
          },
          ...(model
            ? [
                {
                  properties: {
                    data: {
                      $ref: getSchemaPath(model),
                    },
                  },
                },
              ]
            : []),
        ],
      },
    }),
  );
};

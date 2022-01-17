export default (description: string, includes?: string[]) => {
  const params = {
    description,
    type: "object",
    properties: {
      _startIndex: {
        description: "分页开始偏移量",
        type: "integer",
        minimum: 0,
      },
      _maxResults: {
        description: "每次最多的数量",
        type: "integer",
        minimum: 1,
        maximum: 1000,
      },
      _includes: {
        description: "关联资源",
        type: "array",
        items: {
          description: "要关联出来的资源名称",
          type: "string",
          enum: includes,
        },
      },
    },
  };

  if (Array.isArray(includes) && includes.length) {
    params.properties._includes.items.enum = includes;
  }

  return params;
};

export default (fn: Function) =>
  async (...args: any[]) => {
    const res = await fn(...args);
    if (typeof res !== "object") return res;
    // *.detail, *.remove, *.modify, add*
    if (typeof res.toJSON === "function") return res.toJSON();

    // *.*s(list)
    if (res.count && Array.isArray(res.rows))
      res.rows = res.rows.map((x: any) => (typeof x.toJSON === "function" ? x.toJSON() : x));

    return res;
  };

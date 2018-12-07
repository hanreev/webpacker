interface MyObjectOptions {
  name: string;
  count?: number;
}

class MyObject {

  name: string;

  private _count: number;
  public get count(): number {
    return this._count;
  }
  public set count(v: number) {
    this._count = v;
  }

  constructor(options: MyObjectOptions) {
    this.name = options.name;
    this._count = options.count || 0;
  }

  objectMethod(...params: string[]): string {
    return params.join(' ');
  }

  increment(by = 1): void {
    this._count += by;
  }

  decrement(by = 1): void {
    this._count -= by;
  }

}

const obj = new MyObject({ name: 'My Object' });
obj.objectMethod('Hello', 'World!');
obj.increment();
obj.decrement(3);
console.log(obj.count);

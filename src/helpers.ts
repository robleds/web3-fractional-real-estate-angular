export function validateCNPJ(cnpj: string) {
  if (!cnpj) {
    return false;
  }
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj === '' || cnpj.length !== 14) {
    return false;
  }
  for (let i = 1; i < cnpj.length; i++) {
    if (cnpj[i] !== cnpj[0]) {
      break;
    } else {
      if (i === cnpj.length - 1) {
        return false;
      }
    }
  }
  let size: number = cnpj.length - 2;
  let numbers: string = cnpj.slice(0, size);
  const digits: string = cnpj.slice(size);
  let sum = 0;
  let pos: number = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers[size - i], 10) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  let result: number = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits[0], 10)) {
    return false;
  }
  size = size + 1;
  numbers = cnpj.slice(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers[size - i], 10) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  return result === parseInt(digits.charAt(1), 10);
}

export function validateCPF(cpf: string) {
  let sum;
  let rest;
  sum = 0;
  if (!cpf) {
    return false;
  }
  // if (cpf === '00000000000') { return false; }
  for (let i = 1; i < cpf.length; i++) {
    if (cpf[i] !== cpf[0]) {
      break;
    } else {
      if (i === cpf.length - 1) {
        return false;
      }
    }
  }
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.slice(i - 1, i), 10) * (11 - i);
  }
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) {
    rest = 0;
  }
  if (rest !== parseInt(cpf.slice(9, 10), 10)) {
    return false;
  }
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.slice(i - 1, i), 10) * (12 - i);
  }
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) {
    rest = 0;
  }
  return rest === parseInt(cpf.slice(10, 11), 10);
}

export function AutoUnsubscribe() {
  return constructor => {
    const original = constructor.prototype.ngOnDestroy;
    constructor.prototype.ngOnDestroy = () => {
      for (const prop in this) {
        if (this.hasOwnProperty(prop)) {
          const property = this[prop];
          console.log(property);
        }
      }
      original.apply(null);
    };
  };
}

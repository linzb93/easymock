import { Controller } from 'egg';
import {readFile} from 'fs-extra';

export default class HomeController extends Controller {
  public async index() {
    const template = await readFile('app/public/index.html', 'utf8');
    this.ctx.body = template;
  }
}

import { Controller, Post } from '@nestjs/common';

import { ElementsService } from './elements.service';

@Controller('elements')
export class ElementsController {
  constructor(private readonly elementsService: ElementsService) {}

  @Post()
  create() {
    return {};
  }
}

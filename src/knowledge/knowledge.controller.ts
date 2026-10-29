import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeDto, UpdateKnowledgeDto } from './knowledge.dto';

/** Admin only: every route needs the `x-admin-token` header (see AdminGuard). */
@Controller('knowledge')
@UseGuards(AdminGuard)
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}

  // POST /api/knowledge — add one entry
  @Post()
  create(@Body() dto: CreateKnowledgeDto) {
    return this.service.create(dto);
  }

  // POST /api/knowledge/bulk — seed multiple entries at once
  @Post('bulk')
  bulkCreate(@Body() body: { items: CreateKnowledgeDto[] }) {
    return this.service.bulkCreate(body.items);
  }

  // GET /api/knowledge — list all (optionally filter by category)
  @Get()
  findAll(@Query('category') category?: string) {
    return this.service.findAll(category);
  }

  // PUT /api/knowledge/:id — update an entry
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKnowledgeDto) {
    return this.service.update(id, dto);
  }

  // DELETE /api/knowledge/:id — remove an entry
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

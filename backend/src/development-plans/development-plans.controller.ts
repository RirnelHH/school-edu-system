import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DevelopmentPlansService } from './development-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePlanDto, UpdatePlanDto, ApprovePlanDto, RejectPlanDto } from './dto/plan.dto';

@Controller('api/v1/development-plans')
@UseGuards(JwtAuthGuard)
export class DevelopmentPlansController {
  constructor(private developmentPlansService: DevelopmentPlansService) {}

  @Post()
  create(@Request() req: any, @Body() data: CreatePlanDto) {
    return this.developmentPlansService.create(req.user.userId, data);
  }

  @Get()
  findAll(
    @Query('majorId') majorId?: string,
    @Query('status') status?: string,
  ) {
    return this.developmentPlansService.findAll(majorId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.developmentPlansService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() data: UpdatePlanDto) {
    return this.developmentPlansService.update(id, req.user.userId, data);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.developmentPlansService.submit(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Request() req: any, @Body() data: ApprovePlanDto) {
    return this.developmentPlansService.approve(id, req.user.userId, data);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() data: RejectPlanDto) {
    return this.developmentPlansService.reject(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.developmentPlansService.delete(id);
  }
}

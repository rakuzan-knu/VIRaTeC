import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SavedItemDto } from './dto/saved-item.dto';
import { SavedItemsService } from './saved-items.service';

@ApiTags('Users')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Not signed in' })
@UseGuards(JwtAuthGuard)
@Controller('users/me/saved')
export class SavedItemsController {
  constructor(private savedItemsService: SavedItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List saved publications and projects' })
  async list(@CurrentUser('id') userId: string) {
    return this.savedItemsService.list(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Save a publication or project' })
  @ApiResponse({ status: 400, description: 'Saved items limit reached' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async save(@CurrentUser('id') userId: string, @Body() dto: SavedItemDto) {
    return this.savedItemsService.save(userId, dto);
  }

  @Delete('all')
  @ApiOperation({ summary: 'Remove every saved publication and project' })
  async clear(@CurrentUser('id') userId: string) {
    return this.savedItemsService.clear(userId);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove a saved publication or project' })
  async remove(@CurrentUser('id') userId: string, @Body() dto: SavedItemDto) {
    return this.savedItemsService.remove(userId, dto);
  }
}

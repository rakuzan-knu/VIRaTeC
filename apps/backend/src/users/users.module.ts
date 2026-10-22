import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SavedItemsController } from './saved-items.controller';
import { SavedItemsService } from './saved-items.service';

@Module({
  controllers: [SavedItemsController, UsersController],
  providers: [UsersService, SavedItemsService],
  exports: [UsersService],
})
export class UsersModule {}

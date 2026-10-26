import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { ProjectsModule } from '../projects/projects.module';
import { PublicationsModule } from '../publications/publications.module';
import { StaffGuard } from '../common/guards/staff.guard';
import { AdminContentController } from './admin-content.controller';
import { AdminRecordsController } from './admin-records.controller';
import { ContentController } from './content.controller';
import { ContentEditorService } from './content-editor.service';
import { ContentService } from './content.service';
import { ContentfulClient } from './contentful.client';
import { RecordEditorService } from './record-editor.service';

@Module({
  imports: [AuthModule, ProjectsModule, EventsModule, PublicationsModule],
  controllers: [ContentController, AdminContentController, AdminRecordsController],
  providers: [
    ContentfulClient,
    ContentService,
    ContentEditorService,
    RecordEditorService,
    StaffGuard,
  ],
})
export class ContentModule {}

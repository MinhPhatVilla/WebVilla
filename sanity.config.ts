/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { schema } from './src/sanity/schema'

export default defineConfig({
    basePath: '/studio',
    projectId: '1hjd2xbg',
    dataset: 'production',
    title: '🏠 Minh Phát Villa Admin',
    schema,
    plugins: [
        structureTool({
            structure: (S) =>
                S.list()
                    .title('📋 Quản Lý Nội Dung')
                    .items([
                        // Villa & Homestay
                        S.listItem()
                            .title('🏠 Căn Hộ / Villa')
                            .child(
                                S.documentTypeList('property')
                                    .title('Danh Sách Căn')
                            ),
                        S.divider(),

                        // Quản lý đặt phòng
                        S.listItem()
                            .title('📝 Đơn Đặt Phòng')
                            .child(
                                S.documentTypeList('booking')
                                    .title('Tất Cả Đơn')
                            ),

                        // Lịch
                        S.listItem()
                            .title('📅 Lịch Phòng Trống')
                            .child(
                                S.documentTypeList('availability')
                                    .title('Lịch Theo Ngày')
                            ),

                        // Giá
                        S.listItem()
                            .title('💰 Giá Theo Ngày')
                            .child(
                                S.documentTypeList('dailyPricing')
                                    .title('Bảng Giá Đặc Biệt')
                            ),
                    ]),
        }),
    ],
})

/**
 * @module schema（Drizzle ORM 数据库表定义）
 * @description
 * 定义了奕诺系统的15张数据库表，使用Drizzle ORM的pgTable语法。
 *
 * 表清单：
 * 1. verificationCodes   - 手机验证码记录
 * 2. users               - 用户表（手机/邮箱+密码，会员等级）
 * 3. serviceOrders       - 服务单（SV编号，7节点进度）
 * 4. progressLogs        - 进度操作日志
 * 5. messages            - 站内消息
 * 6. announcements       - 系统公告
 * 7. adminNotes          - 管理员备注
 * 8. operationLogs       - 管理员操作日志
 * 9. systemConfig        - 系统配置
 * 10. transactions       - 交易记录
 * 11. sellerFeatures     - 卖家高级功能配置
 * 12. sellerFeatureGrants- 卖家功能授权
 * 13. sellerAchievements - 卖家成就定义
 * 14. sellerAchievementGrants - 卖家成就发放记录
 * 15. deliveryReports    - 交付报告（公证编号/查验token）
 */
import { pgTable, serial, timestamp, varchar, text, integer, boolean, numeric, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Verification codes
export const verificationCodes = pgTable("verification_codes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  used: boolean("used").default(false).notNull(),
});

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Users
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  nickname: varchar("nickname", { length: 128 }),
  membership_level: varchar("membership_level", { length: 20 }).notNull().default("free"),
  membership_expires_at: timestamp("membership_expires_at", { withTimezone: true }),
  is_frozen: boolean("is_frozen").default(false).notNull(),
  seller_id: varchar("seller_id", { length: 6 }).unique(),
  custom_logo: varchar("custom_logo", { length: 500 }),
  avatar_url: varchar("avatar_url", { length: 500 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("users_phone_idx").on(table.phone),
  index("users_email_idx").on(table.email),
  index("users_membership_idx").on(table.membership_level),
]);

// Service orders
export const serviceOrders = pgTable("service_orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  order_no: varchar("order_no", { length: 20 }).notNull().unique(),
  seller_id: varchar("seller_id", { length: 36 }).notNull().references(() => users.id),
  buyer_nickname: varchar("buyer_nickname", { length: 128 }).notNull(),
  service_type: varchar("service_type", { length: 100 }).notNull(),
  service_content: text("service_content").notNull(),
  current_node: integer("current_node").notNull().default(1),
  estimated_delivery: timestamp("estimated_delivery", { withTimezone: true }),
  is_deleted: boolean("is_deleted").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("service_orders_seller_id_idx").on(table.seller_id),
  index("service_orders_order_no_idx").on(table.order_no),
  index("service_orders_current_node_idx").on(table.current_node),
  index("service_orders_created_at_idx").on(table.created_at),
]);

// Progress logs
export const progressLogs = pgTable("progress_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  order_id: varchar("order_id", { length: 36 }).notNull().references(() => serviceOrders.id),
  node: integer("node").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  operator_id: varchar("operator_id", { length: 36 }),
  operator_type: varchar("operator_type", { length: 20 }),
  rejection_reason: text("rejection_reason"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("progress_logs_order_id_idx").on(table.order_id),
  index("progress_logs_created_at_idx").on(table.created_at),
]);

// Messages
export const messages = pgTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("system"),
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("messages_user_id_idx").on(table.user_id),
  index("messages_is_read_idx").on(table.is_read),
]);

// Announcements
export const announcements = pgTable("announcements", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("announcements_created_at_idx").on(table.created_at),
]);

// Admin notes
export const adminNotes = pgTable("admin_notes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  order_id: varchar("order_id", { length: 36 }).notNull().references(() => serviceOrders.id),
  content: text("content").notNull(),
  admin_id: varchar("admin_id", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("admin_notes_order_id_idx").on(table.order_id),
]);

// Operation logs
export const operationLogs = pgTable("operation_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  admin_id: varchar("admin_id", { length: 36 }),
  action: varchar("action", { length: 100 }).notNull(),
  detail: text("detail"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("operation_logs_admin_id_idx").on(table.admin_id),
  index("operation_logs_created_at_idx").on(table.created_at),
]);

// System config
export const systemConfig = pgTable("system_config", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  config_key: varchar("config_key", { length: 100 }).notNull().unique(),
  config_value: text("config_value").notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("system_config_key_idx").on(table.config_key),
]);

// Contact config
export const contactConfig = pgTable("contact_config", {
  config_key: varchar("config_key", { length: 50 }).primaryKey(),
  config_value: text("config_value").notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Survey questions
export const surveyQuestions = pgTable("survey_questions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  question_text: text("question_text").notNull(),
  question_type: varchar("question_type", { length: 20 }).notNull().default("single_choice"),
  options: jsonb("options"),
  is_required: boolean("is_required").default(true).notNull(),
  sort_order: integer("sort_order").default(0).notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("survey_questions_sort_idx").on(table.sort_order),
]);

// Survey responses
export const surveyResponses = pgTable("survey_responses", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 36 }).references(() => users.id),
  answers: jsonb("answers").notNull(),
  submitted_at: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("survey_responses_user_id_idx").on(table.user_id),
  index("survey_responses_submitted_at_idx").on(table.submitted_at),
]);

// Buyer Addon Permissions
export const buyerAddonPermissions = pgTable("buyer_addon_permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  addon_type: varchar("addon_type", { length: 50 }).notNull(),
  granted_by: varchar("granted_by", { length: 36 }),
  expires_at: timestamp("expires_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("buyer_addon_perms_user_id_idx").on(table.user_id),
]);

// Seller Features
export const sellerFeatures = pgTable("seller_features", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  feature_key: varchar("feature_key", { length: 50 }).notNull().unique(),
  feature_name: varchar("feature_name", { length: 100 }).notNull(),
  description: text("description"),
  min_level: varchar("min_level", { length: 20 }).notNull().default("pro"),
  is_enabled: boolean("is_enabled").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export const sellerFeatureGrants = pgTable("seller_feature_grants", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  feature_key: varchar("feature_key", { length: 50 }).notNull().references(() => sellerFeatures.feature_key),
  granted_by: varchar("granted_by", { length: 36 }),
  expires_at: timestamp("expires_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("seller_feature_grants_user_id_idx").on(table.user_id),
]);

// Seller Achievements
export const sellerAchievements = pgTable("seller_achievements", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  achievement_key: varchar("achievement_key", { length: 50 }).notNull().unique(),
  achievement_name: varchar("achievement_name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull().default("🏆"),
  condition_type: varchar("condition_type", { length: 50 }).notNull(),
  condition_value: integer("condition_value").notNull().default(0),
  sort_order: integer("sort_order").notNull().default(0),
  is_enabled: boolean("is_enabled").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const sellerAchievementGrants = pgTable("seller_achievement_grants", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  achievement_id: varchar("achievement_id", { length: 36 }).notNull().references(() => sellerAchievements.id),
  granted_at: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
  is_notified: boolean("is_notified").default(false).notNull(),
}, (table) => [
  index("seller_achievement_grants_user_id_idx").on(table.user_id),
]);

// Delivery Reports
export const deliveryReports = pgTable("delivery_reports", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  order_id: varchar("order_id", { length: 36 }).notNull().references(() => serviceOrders.id),
  notarization_no: varchar("notarization_no", { length: 50 }).notNull().unique(),
  verify_token: varchar("verify_token", { length: 100 }).notNull().unique().default(sql`encode(gen_random_bytes(16), 'hex')`),
  summary: text("summary"),
  // P0 升级字段
  ai_detection_status: varchar("ai_detection_status", { length: 20 }).default("pending"), // passed | pending | failed
  ai_detection_result: jsonb("ai_detection_result"), // AI 检测结果详情
  checklist_completed: jsonb("checklist_completed"), // 品类清单已完成项 ID 数组
  copyright_declaration: jsonb("copyright_declaration"), // 版权声明数据
  generated_at: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("delivery_reports_order_id_idx").on(table.order_id),
]);

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  item_name: varchar("item_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("paid"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("transactions_user_id_idx").on(table.user_id),
  index("transactions_type_idx").on(table.type),
  index("transactions_created_at_idx").on(table.created_at),
]);

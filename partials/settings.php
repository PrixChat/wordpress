<?php
// Do not load this file directly
if (!defined('ABSPATH')) {
    exit;
}
global $wp_roles;

$settings = prixchat_get_settings();
$emojis = prixchat_get_settings('emojis');
$emojis_string = implode(',', $emojis);
?>

<div class="wrap">
    <h1><?php esc_html_e('Settings', 'prixchat'); ?></h1>
    <form method="post" action="<?php echo admin_url('admin.php?page=prixchat-settings') ?>">
        <?php wp_nonce_field('prixchat', 'prixchat', true, true); ?>
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <th scope="row">
                        <label for="emojis">Reaction Emojis</label>
                    </th>
                    <td>
                        <input type="text" id="emojis" name="emojis" value="<?php esc_html_e($emojis_string) ?>" class="regular-text" />
                        <p class="description">
                            <?php esc_html_e('Enter all available emojis for reaction in chat app. Separate by commas.', 'prixchat'); ?>
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="roles">Roles</label>
                    </th>
                    <td>
                        <?php 
                        $roles = prixchat_get_settings('roles');
                        if ($roles === 'all') : ?>
                            <div>
                                <input type="checkbox" name="roles[]" value="all" id="all" checked />
                                <label for="all"><?php esc_html_e('All', 'prixchat'); ?></label>
                            </div>
                        <?php endif; ?>

                        <?php foreach ($wp_roles->role_names as $name => $role) : 
                            ?>
                            <div>
                                <input 
                                    type="checkbox" 
                                    name="roles[]" 
                                    value="<?php esc_html_e($name) ?>" 
                                    id="<?php esc_html_e($name) ?>" 
                                    <?php checked(
                                            true, (
                                            (is_array($roles) && in_array($name, $roles)) || 
                                            (is_string($roles) && $roles === 'all')
                                            ),
                                            true
                                        )
                                    ?>
                                />
                                <label for="<?php esc_html_e($name) ?>"><?php esc_html_e($role) ?></label>
                            </div>
                        <?php endforeach; ?>

                        <p class="description">
                            <?php esc_html_e('Select roles that can use chat app. All by default.', 'prixchat'); ?>
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="incoming_message_sound">Incoming messages sound</label>
                    </th>
                    <td>
                        <input type="url" id="incoming_messages_sound" name="incoming_messages_sound" value="<?php esc_html_e(prixchat_get_settings('incoming_messages_sound')) ?>" class="regular-text" />
                        <p class="description">
                            <?php esc_html_e('Enter alert sound URL.', 'prixchat'); ?>
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
        <?php
        submit_button();
        ?>
    </form>
</div>
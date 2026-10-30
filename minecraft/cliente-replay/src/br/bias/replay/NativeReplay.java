package br.bias.replay;

import net.minecraft.class_310;
import net.minecraft.class_742;

/** Native first-person rendering for the recording client only. */
public final class NativeReplay {
    public static final boolean ENABLED = Boolean.getBoolean("bias.replay.native");
    public static boolean drawingHands = false;
    public static class_742 target() {
        class_310 client = class_310.method_1551();
        if (!ENABLED || client.field_1724 == null) return null;
        return client.method_1560() instanceof class_742 player && player != client.field_1724 ? player : null;
    }
}

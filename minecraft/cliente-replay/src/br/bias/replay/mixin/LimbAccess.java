package br.bias.replay.mixin;
import net.minecraft.class_8080;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;
@Mixin(value=class_8080.class,remap=false)
public interface LimbAccess {
    @Accessor("field_42109") void bias$previous(float value);
    @Accessor("field_42110") void bias$speed(float value);
    @Accessor("field_42111") void bias$position(float value);
}
